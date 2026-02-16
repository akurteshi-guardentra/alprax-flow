import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stripe payment intent IDs start with "pi_"
const STRIPE_PI_REGEX = /^pi_[a-zA-Z0-9]{10,100}$/;
// UUID v4 format
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting payment confirmation");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Payment service not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { paymentIntentId, orderId } = body as Record<string, unknown>;

    // Validate paymentIntentId format
    if (typeof paymentIntentId !== 'string' || !STRIPE_PI_REGEX.test(paymentIntentId)) {
      return new Response(JSON.stringify({ error: "Invalid payment intent ID format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate orderId format (UUID)
    if (typeof orderId !== 'string' || !UUID_REGEX.test(orderId)) {
      return new Response(JSON.stringify({ error: "Invalid order ID format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Confirming payment", { paymentIntentId, orderId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    logStep("Payment intent retrieved", { 
      status: paymentIntent.status,
      amount: paymentIntent.amount 
    });

    // Determine order status
    let orderStatus = 'pending';
    if (paymentIntent.status === 'succeeded') {
      orderStatus = 'paid';
    } else if (paymentIntent.status === 'canceled') {
      orderStatus = 'canceled';
    } else if (paymentIntent.status === 'processing') {
      orderStatus = 'processing';
    } else if (paymentIntent.status === 'requires_payment_method') {
      orderStatus = 'payment_failed';
    }

    // Update order - scoped to user_id for security
    const { data: updatedOrder, error: updateError } = await supabaseClient
      .from('orders')
      .update({
        status: orderStatus,
        payment_method: paymentIntent.payment_method_types?.[0] || 'card',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      logStep("Error updating order", { error: updateError.message });
      throw new Error("Failed to update order");
    }

    logStep("Order updated successfully", { orderId: updatedOrder.id, status: updatedOrder.status });

    // Create funding transaction on success
    if (paymentIntent.status === 'succeeded') {
      const { error: fundingError } = await supabaseClient
        .from('funding_transactions')
        .insert({
          user_id: user.id,
          payment_intent_id: orderId,
          amount_usd: paymentIntent.amount / 100,
          status: 'completed',
          completed_at: new Date().toISOString(),
        });

      if (fundingError) {
        logStep("Error creating funding transaction", { error: fundingError.message });
      }
    }

    return new Response(JSON.stringify({
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      orderId: updatedOrder.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: "Payment confirmation failed. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
