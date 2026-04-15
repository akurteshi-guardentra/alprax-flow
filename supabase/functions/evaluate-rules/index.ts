import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate: require a valid cron secret, service role key, or anon key (for pg_cron internal calls)
    const cronSecret = Deno.env.get("CRON_SECRET");
    const reqCronSecret = req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("Authorization") || "";

    const isAuthorizedViaCron = cronSecret && reqCronSecret === cronSecret;
    const isAuthorizedViaServiceRole = authHeader.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "NONE");
    // pg_cron + pg_net sends the anon key — accept it as a valid internal caller
    const isAuthorizedViaAnonKey = authHeader.includes(Deno.env.get("SUPABASE_ANON_KEY") || "NONE");

    if (!isAuthorizedViaCron && !isAuthorizedViaServiceRole && !isAuthorizedViaAnonKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for backend processing
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all active scheduled rules that are due
    const { data: dueRules, error: fetchError } = await supabase
      .from("payment_rules")
      .select("*")
      .eq("is_active", true)
      .eq("rule_type", "scheduled")
      .lte("next_trigger_at", new Date().toISOString())
      .order("next_trigger_at", { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    const results: any[] = [];

    for (const rule of dueRules || []) {
      try {
        const actionConfig = rule.action_config as any;
        const triggerConfig = rule.trigger_config as any;

        // Queue the payment
        const { data: txData, error: txError } = await supabase
          .from("transaction_queue")
          .insert({
            user_id: rule.user_id,
            recipient_address: actionConfig.recipient_email,
            amount: actionConfig.amount,
            memo: actionConfig.memo || `AutoPay: ${rule.rule_name}`,
            metadata: {
              currency: actionConfig.currency,
              source: "autopay_rule",
              rule_id: rule.id,
              rule_name: rule.rule_name,
            },
            status: "pending",
            priority: 0,
          })
          .select()
          .single();

        if (txError) {
          results.push({
            rule_id: rule.id,
            success: false,
            error: "Failed to queue payment",
          });
          continue;
        }

        // Calculate next trigger
        const frequency = triggerConfig.frequency || "weekly";
        const nextTrigger = new Date();
        switch (frequency) {
          case "daily":
            nextTrigger.setDate(nextTrigger.getDate() + 1);
            break;
          case "weekly":
            nextTrigger.setDate(nextTrigger.getDate() + 7);
            break;
          case "biweekly":
            nextTrigger.setDate(nextTrigger.getDate() + 14);
            break;
          case "monthly":
            nextTrigger.setMonth(nextTrigger.getMonth() + 1);
            break;
        }

        // Update rule
        await supabase
          .from("payment_rules")
          .update({
            last_triggered_at: new Date().toISOString(),
            next_trigger_at: nextTrigger.toISOString(),
            execution_count: (rule.execution_count || 0) + 1,
          })
          .eq("id", rule.id);

        results.push({
          rule_id: rule.id,
          rule_name: rule.rule_name,
          success: true,
          transaction_id: txData.id,
          next_trigger: nextTrigger.toISOString(),
        });
      } catch (ruleError) {
        results.push({
          rule_id: rule.id,
          success: false,
          error: "Processing failed",
        });
      }
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
