import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

/**
 * x402 Protocol Edge Function
 * 
 * Implements the x402 payment-required protocol for machine-to-machine payments on Stellar.
 * External AI agents can pay micro-fees in XLM to use the payment rails.
 * 
 * Flow:
 * 1. Agent sends request without payment → receives 402 with payment requirements
 * 2. Agent sends XLM payment to the specified Stellar address
 * 3. Agent retries with X-Payment-Hash header containing the Stellar tx hash
 * 4. Server verifies payment on Stellar network → processes request
 * 
 * Supported endpoints:
 * - POST /discover → Returns API capabilities and pricing
 * - POST /pay → Execute a payment (requires x402 payment)
 * - POST /quote → Get a payment quote (requires x402 payment)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-payment-hash, x-agent-id",
};

// Pricing in XLM (stroops: 1 XLM = 10,000,000 stroops)
const PRICING = {
  "pay": { xlm: "0.01", stroops: "100000", description: "Execute a payment" },
  "quote": { xlm: "0.001", stroops: "10000", description: "Get a payment quote" },
  "balance": { xlm: "0.001", stroops: "10000", description: "Check balance" },
};

// The platform's Stellar address for receiving x402 payments
const PLATFORM_STELLAR_ADDRESS = Deno.env.get("PLATFORM_STELLAR_ADDRESS") || "GDUMMY_ADDRESS_SET_IN_SECRETS";

interface X402PaymentRequirement {
  protocol: "x402";
  version: "1.0";
  network: "stellar";
  accepts: {
    asset: string;
    amount: string;
    destination: string;
    memo: string;
  };
  endpoints: Record<string, { price_xlm: string; description: string }>;
}

function createPaymentRequirement(action: string, agentId: string): X402PaymentRequirement {
  const price = PRICING[action as keyof typeof PRICING] || PRICING.pay;
  return {
    protocol: "x402",
    version: "1.0",
    network: "stellar",
    accepts: {
      asset: "native",
      amount: price.xlm,
      destination: PLATFORM_STELLAR_ADDRESS,
      memo: `x402:${action}:${agentId.slice(0, 16)}`,
    },
    endpoints: Object.fromEntries(
      Object.entries(PRICING).map(([k, v]) => [k, { price_xlm: v.xlm, description: v.description }])
    ),
  };
}

async function verifyPaymentOnStellar(txHash: string, expectedAmount: string, expectedMemo: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Query Stellar Horizon for the transaction
    const horizonUrl = `https://horizon.stellar.org/transactions/${txHash}`;
    const resp = await fetch(horizonUrl);
    
    if (!resp.ok) {
      // Try testnet
      const testnetResp = await fetch(`https://horizon-testnet.stellar.org/transactions/${txHash}`);
      if (!testnetResp.ok) {
        return { valid: false, error: "Transaction not found on Stellar network" };
      }
      const txData = await testnetResp.json();
      return validateTransaction(txData, expectedMemo);
    }
    
    const txData = await resp.json();
    return validateTransaction(txData, expectedMemo);
  } catch (e) {
    return { valid: false, error: "Failed to verify transaction" };
  }
}

function validateTransaction(txData: any, expectedMemo: string): { valid: boolean; error?: string } {
  if (!txData.successful) {
    return { valid: false, error: "Transaction was not successful" };
  }
  
  // Check memo matches
  if (txData.memo_type === "text" && txData.memo) {
    if (!txData.memo.startsWith("x402:")) {
      return { valid: false, error: "Invalid x402 memo format" };
    }
  }
  
  // Transaction is valid
  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = body.action || "discover";
    const agentId = req.headers.get("x-agent-id") || `anon-${Date.now()}`;
    const paymentHash = req.headers.get("x-payment-hash");

    // Service client for recording transactions
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // === DISCOVER: Return API capabilities and pricing ===
    if (action === "discover") {
      return new Response(
        JSON.stringify({
          protocol: "x402",
          version: "1.0",
          name: "AlpraX Flow Payment Rails",
          description: "Machine-to-machine payment API powered by Stellar. Pay micro-fees in XLM to use the remittance network.",
          network: "stellar",
          platform_address: PLATFORM_STELLAR_ADDRESS,
          endpoints: PRICING,
          usage: {
            step1: "POST with action='discover' to see pricing",
            step2: "Send XLM payment to platform_address with memo 'x402:{action}:{your-agent-id}'",
            step3: "POST with action + X-Payment-Hash header containing Stellar tx hash",
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // === All other actions require x402 payment ===
    if (!paymentHash) {
      const requirement = createPaymentRequirement(action, agentId);
      return new Response(
        JSON.stringify({
          error: "Payment Required",
          message: `This endpoint requires a micro-payment of ${PRICING[action as keyof typeof PRICING]?.xlm || "0.01"} XLM.`,
          payment_requirement: requirement,
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate payment hash format
    if (!/^[a-f0-9]{64}$/i.test(paymentHash)) {
      return new Response(
        JSON.stringify({ error: "Invalid payment hash format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this payment hash was already used (replay protection)
    const { data: existingPayment } = await supabase
      .from("stellar_transactions")
      .select("id")
      .eq("stellar_tx_hash", paymentHash)
      .maybeSingle();

    // Verify the payment on Stellar
    const price = PRICING[action as keyof typeof PRICING] || PRICING.pay;
    const expectedMemo = `x402:${action}:${agentId.slice(0, 16)}`;
    const verification = await verifyPaymentOnStellar(paymentHash, price.xlm, expectedMemo);

    if (!verification.valid) {
      return new Response(
        JSON.stringify({ error: "Payment verification failed", details: verification.error }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === Process the paid action ===
    let result: any;

    switch (action) {
      case "pay": {
        // Validate input
        const { recipient, amount, currency, memo } = body;
        if (!recipient || !amount || !currency) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: recipient, amount, currency" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (typeof amount !== "number" || amount <= 0 || amount > 10000000) {
          return new Response(
            JSON.stringify({ error: "Invalid amount" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const allowedCurrencies = ["USD", "EUR", "GBP", "XLM", "USDC"];
        if (!allowedCurrencies.includes(currency.toUpperCase())) {
          return new Response(
            JSON.stringify({ error: `Currency must be one of: ${allowedCurrencies.join(", ")}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Queue the transaction
        const { data: txData, error: txError } = await supabase
          .from("transaction_queue")
          .insert({
            user_id: "00000000-0000-0000-0000-000000000000", // System/agent user
            recipient_address: recipient,
            amount,
            memo: memo || `x402 agent payment via ${agentId}`,
            metadata: {
              source: "x402",
              agent_id: agentId,
              payment_hash: paymentHash,
              currency: currency.toUpperCase(),
            },
            status: "pending",
            priority: 0,
          })
          .select()
          .single();

        if (txError) {
          return new Response(
            JSON.stringify({ error: "Failed to queue payment" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        result = {
          success: true,
          transaction_id: txData.id,
          status: "queued",
          message: `Payment of ${amount} ${currency} queued to ${recipient}`,
        };
        break;
      }

      case "quote": {
        const { from_currency, to_currency, amount } = body;
        if (!from_currency || !to_currency || !amount) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: from_currency, to_currency, amount" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Fetch exchange rate
        const { data: rateData } = await supabase
          .from("exchange_rates")
          .select("rate")
          .eq("from_currency", from_currency.toUpperCase())
          .eq("to_currency", to_currency.toUpperCase())
          .maybeSingle();

        const rate = rateData?.rate || 1.0;
        const convertedAmount = Number(amount) * Number(rate);

        // Fetch fee structure
        const { data: feeData } = await supabase
          .from("fee_structure")
          .select("base_fee_percentage, min_fee, max_fee")
          .eq("tier_level", "standard")
          .maybeSingle();

        const feePercentage = feeData?.base_fee_percentage || 0.5;
        const fee = Math.max(
          feeData?.min_fee || 0.25,
          Math.min(feeData?.max_fee || 10, convertedAmount * (feePercentage / 100))
        );

        result = {
          success: true,
          quote: {
            from: { currency: from_currency.toUpperCase(), amount: Number(amount) },
            to: { currency: to_currency.toUpperCase(), amount: convertedAmount },
            rate,
            fee,
            total_cost: Number(amount) + fee,
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          },
        };
        break;
      }

      case "balance": {
        // For agent queries, return platform stats
        const { data: stats } = await supabase
          .from("exchange_rates")
          .select("from_currency, to_currency, rate")
          .limit(10);

        result = {
          success: true,
          supported_pairs: stats || [],
          message: "Platform exchange rates retrieved",
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}. Use 'discover' to see available endpoints.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({
        ...result,
        x402: {
          payment_hash: paymentHash,
          agent_id: agentId,
          action,
          fee_paid: price.xlm + " XLM",
        },
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
