import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_CURRENCIES = ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'chf', 'zar', 'ngn', 'kes', 'ghs'];
const MAX_AMOUNT = 1000000; // $1M max
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_METADATA_SIZE = 2000;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT-INTENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting payment intent creation");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Payment service not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
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
    if (!user?.email) {
      return new Response(JSON.stringify({ error: "User email not available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

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

    const { amount, currency, description, metadata } = body as Record<string, unknown>;

    // Validate amount
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
      return new Response(JSON.stringify({ error: `Amount must be between 0 and ${MAX_AMOUNT}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate currency
    const normalizedCurrency = typeof currency === 'string' ? currency.toLowerCase().trim() : 'usd';
    if (!ALLOWED_CURRENCIES.includes(normalizedCurrency)) {
      return new Response(JSON.stringify({ error: `Unsupported currency. Allowed: ${ALLOWED_CURRENCIES.join(', ')}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate description
    const sanitizedDescription = typeof description === 'string' 
      ? description.slice(0, MAX_DESCRIPTION_LENGTH).trim() 
      : 'Payment via Alprax Flow';

    // Validate metadata
    let sanitizedMetadata: Record<string, string> = {};
    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
      const metadataStr = JSON.stringify(metadata);
      if (metadataStr.length > MAX_METADATA_SIZE) {
        return new Response(JSON.stringify({ error: "Metadata too large" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      // Only allow string values in metadata
      for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
        if (typeof key === 'string' && typeof value === 'string') {
          sanitizedMetadata[key.slice(0, 100)] = (value as string).slice(0, 500);
        }
      }
    }

    logStep("Input validated", { amount, currency: normalizedCurrency });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
      });
      customerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: normalizedCurrency,
      customer: customerId,
      description: sanitizedDescription,
      metadata: {
        user_id: user.id,
        ...sanitizedMetadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logStep("Payment intent created", { paymentIntentId: paymentIntent.id });

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        stripe_session_id: paymentIntent.id,
        amount: Math.round(amount * 100),
        currency: normalizedCurrency,
        status: 'pending',
        description: sanitizedDescription,
      })
      .select()
      .single();

    if (orderError) {
      logStep("Error creating order", { error: orderError.message });
      throw new Error("Failed to create order record");
    }

    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: "Payment processing failed. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
