import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tools = [
  {
    type: "function",
    function: {
      name: "send_payment",
      description:
        "Send a payment to a recipient. Use when the user wants to transfer money to someone.",
      parameters: {
        type: "object",
        properties: {
          recipient_email: {
            type: "string",
            description: "Recipient email address",
          },
          amount: { type: "number", description: "Amount to send" },
          currency: {
            type: "string",
            enum: ["USD", "EUR", "GBP"],
            description: "Currency code",
          },
          memo: {
            type: "string",
            description: "Optional memo/note for the payment",
          },
        },
        required: ["recipient_email", "amount", "currency"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_rule",
      description:
        "Create an automated payment rule. Use for scheduled recurring payments, conditional payments based on balance, or split payments.",
      parameters: {
        type: "object",
        properties: {
          rule_name: { type: "string", description: "Name for this rule" },
          rule_type: {
            type: "string",
            enum: ["scheduled", "conditional", "split"],
            description: "Type of automation rule",
          },
          recipient_email: {
            type: "string",
            description: "Recipient email for the payment",
          },
          amount: { type: "number", description: "Amount to send" },
          currency: {
            type: "string",
            enum: ["USD", "EUR", "GBP"],
            description: "Currency",
          },
          frequency: {
            type: "string",
            enum: ["daily", "weekly", "biweekly", "monthly"],
            description: "How often to trigger (for scheduled rules)",
          },
          condition: {
            type: "string",
            description:
              "Condition description (for conditional rules), e.g. 'balance > 1000'",
          },
          split_percentage: {
            type: "number",
            description:
              "Percentage of incoming funds to split (for split rules)",
          },
          memo: { type: "string", description: "Optional memo" },
        },
        required: ["rule_name", "rule_type", "recipient_email", "amount", "currency"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_rules",
      description: "List all active payment automation rules for the user.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_balance",
      description: "Check the user's current account balance.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_rule",
      description: "Deactivate/delete a payment automation rule by its name.",
      parameters: {
        type: "object",
        properties: {
          rule_name: {
            type: "string",
            description: "Name of the rule to deactivate",
          },
        },
        required: ["rule_name"],
        additionalProperties: false,
      },
    },
  },
];

function getSupabaseClient(authHeader: string) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

async function getUserId(supabase: any): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

function calculateNextTrigger(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1);
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      break;
    case "biweekly":
      now.setDate(now.getDate() + 14);
      break;
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      now.setDate(now.getDate() + 7);
  }
  return now.toISOString();
}

async function executeTool(
  toolName: string,
  args: any,
  supabase: any,
  userId: string
): Promise<string> {
  switch (toolName) {
    case "send_payment": {
      // Queue the transaction via transaction_queue
      const { data, error } = await supabase
        .from("transaction_queue")
        .insert({
          user_id: userId,
          recipient_address: args.recipient_email,
          amount: args.amount,
          memo: args.memo || `AutoPay: ${args.currency} payment`,
          metadata: { currency: args.currency, source: "ai_agent" },
          status: "pending",
          priority: 1,
        })
        .select()
        .single();

      if (error) return JSON.stringify({ success: false, error: error.message });
      return JSON.stringify({
        success: true,
        transaction_id: data.id,
        message: `Payment of ${args.amount} ${args.currency} queued to ${args.recipient_email}`,
      });
    }

    case "create_rule": {
      const triggerConfig: any = {};
      const actionConfig: any = {
        recipient_email: args.recipient_email,
        amount: args.amount,
        currency: args.currency,
        memo: args.memo || "",
      };

      if (args.rule_type === "scheduled") {
        triggerConfig.frequency = args.frequency || "weekly";
      } else if (args.rule_type === "conditional") {
        triggerConfig.condition = args.condition || "balance > 0";
      } else if (args.rule_type === "split") {
        triggerConfig.split_percentage = args.split_percentage || 50;
      }

      const nextTrigger =
        args.rule_type === "scheduled"
          ? calculateNextTrigger(triggerConfig.frequency)
          : null;

      const { data, error } = await supabase
        .from("payment_rules")
        .insert({
          user_id: userId,
          rule_name: args.rule_name,
          rule_type: args.rule_type,
          trigger_config: triggerConfig,
          action_config: actionConfig,
          is_active: true,
          next_trigger_at: nextTrigger,
        })
        .select()
        .single();

      if (error) return JSON.stringify({ success: false, error: error.message });
      return JSON.stringify({
        success: true,
        rule_id: data.id,
        message: `Rule "${args.rule_name}" created successfully. Type: ${args.rule_type}`,
      });
    }

    case "list_rules": {
      const { data, error } = await supabase
        .from("payment_rules")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) return JSON.stringify({ success: false, error: error.message });
      const rules = (data || []).map((r: any) => ({
        name: r.rule_name,
        type: r.rule_type,
        recipient: r.action_config?.recipient_email,
        amount: r.action_config?.amount,
        currency: r.action_config?.currency,
        frequency: r.trigger_config?.frequency,
        next_trigger: r.next_trigger_at,
        executions: r.execution_count,
      }));
      return JSON.stringify({ success: true, rules, count: rules.length });
    }

    case "check_balance": {
      const { data } = await supabase
        .from("wallet_balances")
        .select("amount, currency")
        .eq("user_id", userId);

      const balances = (data || []).map((b: any) => ({
        amount: b.amount,
        currency: b.currency,
      }));
      return JSON.stringify({ success: true, balances });
    }

    case "delete_rule": {
      const { error } = await supabase
        .from("payment_rules")
        .update({ is_active: false })
        .eq("user_id", userId)
        .ilike("rule_name", args.rule_name);

      if (error) return JSON.stringify({ success: false, error: error.message });
      return JSON.stringify({
        success: true,
        message: `Rule "${args.rule_name}" has been deactivated.`,
      });
    }

    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = getSupabaseClient(authHeader);
    const userId = await getUserId(supabase);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, conversation_id } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY)
      throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are AutoPay Agent, an AI-powered payment assistant for AlpraX Flow — a global remittance and payments platform built on Stellar.

You help users:
1. **Send payments** — just say something like "send $50 to maria@email.com" and you'll execute it
2. **Create automation rules** — set up recurring payments, conditional transfers, or split payments
3. **Manage rules** — list, modify, or delete existing automation rules
4. **Check balances** — quickly view account balances

When creating rules, always confirm the details before executing. Be friendly, concise, and helpful.
For amounts, default to USD unless specified otherwise.
Always format currency amounts properly (e.g., $100.00).

Examples of rules users might create:
- "Send $100 to mom every Friday" → scheduled rule, weekly
- "Auto-split 50% of incoming to savings" → split rule
- "Send $200 to rent@landlord.com on the 1st of each month" → scheduled rule, monthly

When a tool returns results, present them in a clear, formatted way using markdown.`;

    // First AI call with tools
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          tools,
          stream: false,
        }),
      }
    );

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await aiResponse.text();
      console.error("AI gateway error:", status, text);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const choice = aiData.choices?.[0];

    // If the model wants to call tools
    if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
      const toolResults: any[] = [];

      for (const toolCall of choice.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        const result = await executeTool(toolName, toolArgs, supabase, userId);
        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      // Second AI call with tool results to get final response
      const followUpMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        choice.message,
        ...toolResults,
      ];

      const followUpResponse = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: followUpMessages,
            stream: true,
          }),
        }
      );

      if (!followUpResponse.ok) {
        throw new Error("Follow-up AI call failed");
      }

      // Save messages to chat_messages
      const convId = conversation_id || crypto.randomUUID();
      // Save user's last message
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg) {
        await supabase.from("chat_messages").insert({
          user_id: userId,
          conversation_id: convId,
          role: lastUserMsg.role,
          content: lastUserMsg.content,
        });
      }

      return new Response(followUpResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "X-Conversation-Id": convId,
        },
      });
    }

    // No tool calls — stream directly
    // We need to re-call with streaming since we used stream:false for tool detection
    const streamResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      }
    );

    const convId = conversation_id || crypto.randomUUID();
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg) {
      await supabase.from("chat_messages").insert({
        user_id: userId,
        conversation_id: convId,
        role: lastUserMsg.role,
        content: lastUserMsg.content,
      });
    }

    return new Response(streamResponse.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Conversation-Id": convId,
      },
    });
  } catch (e) {
    console.error("ai-agent error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
