-- Phase 1: Create new tables for error tracking and transaction management

-- Create enhanced error logging table
CREATE TABLE IF NOT EXISTS payment_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_id UUID,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB DEFAULT '{}',
  stellar_tx_hash TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on payment_errors
ALTER TABLE payment_errors ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_errors
CREATE POLICY "Users can view their own payment errors" 
ON payment_errors FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment errors" 
ON payment_errors FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create transaction queue table for better state management
CREATE TABLE IF NOT EXISTS transaction_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recipient_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  memo TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  stellar_tx_hash TEXT
);

-- Enable RLS on transaction_queue
ALTER TABLE transaction_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for transaction_queue
CREATE POLICY "Users can manage their own transaction queue" 
ON transaction_queue FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_errors_user_created ON payment_errors (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_queue_status ON transaction_queue (status, created_at);
CREATE INDEX IF NOT EXISTS idx_stellar_transactions_user_status ON stellar_transactions (user_id, status, created_at DESC);