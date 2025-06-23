
-- Create payment_intents table to track Stripe payment intents
CREATE TABLE public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  client_secret TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create funding_transactions table to track account funding
CREATE TABLE public.funding_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_intent_id UUID REFERENCES public.payment_intents(id),
  amount_usd NUMERIC NOT NULL,
  amount_xlm NUMERIC,
  exchange_rate NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  stellar_tx_hash TEXT,
  error_message TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create stored_payment_methods table for user payment methods
CREATE TABLE public.stored_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT NOT NULL,
  card_last4 TEXT,
  card_brand TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stored_payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_intents
CREATE POLICY "Users can view their own payment intents" 
  ON public.payment_intents 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment intents" 
  ON public.payment_intents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment intents" 
  ON public.payment_intents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for funding_transactions
CREATE POLICY "Users can view their own funding transactions" 
  ON public.funding_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own funding transactions" 
  ON public.funding_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funding transactions" 
  ON public.funding_transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for stored_payment_methods
CREATE POLICY "Users can view their own payment methods" 
  ON public.stored_payment_methods 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" 
  ON public.stored_payment_methods 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" 
  ON public.stored_payment_methods 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" 
  ON public.stored_payment_methods 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_payment_intents_user_id ON public.payment_intents(user_id);
CREATE INDEX idx_payment_intents_stripe_id ON public.payment_intents(stripe_payment_intent_id);
CREATE INDEX idx_funding_transactions_user_id ON public.funding_transactions(user_id);
CREATE INDEX idx_funding_transactions_payment_intent ON public.funding_transactions(payment_intent_id);
CREATE INDEX idx_stored_payment_methods_user_id ON public.stored_payment_methods(user_id);
