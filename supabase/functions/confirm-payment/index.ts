import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmPaymentRequest {
  paymentIntentId: string;
  orderId: string;
}

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
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    // Create Supabase client using service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }

    const user = userData.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const { paymentIntentId, orderId }: ConfirmPaymentRequest = await req.json();

    if (!paymentIntentId || !orderId) {
      throw new Error("Missing required parameters");
    }

    logStep("Confirming payment", { paymentIntentId, orderId });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve payment intent to check status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    logStep("Payment intent retrieved", { 
      status: paymentIntent.status,
      amount: paymentIntent.amount 
    });

    // Update order status based on payment intent status
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

    // Update order in database
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
      logStep("Error updating order", { error: updateError });
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    logStep("Order updated successfully", { 
      orderId: updatedOrder.id,
      status: updatedOrder.status 
    });

    // If payment succeeded, create funding transaction
    if (paymentIntent.status === 'succeeded') {
      logStep("Creating funding transaction");
      
      // Create funding transaction for successful payment
      const { error: fundingError } = await supabaseClient
        .from('funding_transactions')
        .insert({
          user_id: user.id,
          payment_intent_id: orderId,
          amount_usd: paymentIntent.amount / 100, // Convert from cents
          status: 'completed',
          completed_at: new Date().toISOString(),
        });

      if (fundingError) {
        logStep("Error creating funding transaction", { error: fundingError });
        // Don't throw here as the main payment already succeeded
      } else {
        logStep("Funding transaction created successfully");
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});