-- Phase 1: Database Cleanup & Structure Improvement

-- 1. Add unique constraint to prevent multiple primary accounts per user
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_stellar_accounts_user_primary 
ON stellar_accounts (user_id) 
WHERE is_primary = true;

-- 2. Clean up duplicate accounts - keep only the most recent primary account per user
WITH ranked_accounts AS (
  SELECT id, user_id, 
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM stellar_accounts 
  WHERE is_primary = true
),
accounts_to_update AS (
  SELECT id FROM ranked_accounts WHERE rn > 1
)
UPDATE stellar_accounts 
SET is_primary = false 
WHERE id IN (SELECT id FROM accounts_to_update);

-- 3. Create enhanced error logging table
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

-- Create policy for payment_errors
CREATE POLICY "Users can view their own payment errors" 
ON payment_errors FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment errors" 
ON payment_errors FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Create transaction queue table for better state management
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

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_errors_user_created ON payment_errors (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_queue_status ON transaction_queue (status, created_at);
CREATE INDEX IF NOT EXISTS idx_stellar_transactions_user_status ON stellar_transactions (user_id, status, created_at DESC);

-- 6. Enable realtime for live updates
ALTER TABLE payment_errors REPLICA IDENTITY FULL;
ALTER TABLE transaction_queue REPLICA IDENTITY FULL;
ALTER TABLE stellar_transactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$ 
BEGIN
  -- Add payment_errors to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'payment_errors'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE payment_errors;
  END IF;
  
  -- Add transaction_queue to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'transaction_queue'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE transaction_queue;
  END IF;
  
  -- Add stellar_transactions to realtime if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'stellar_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE stellar_transactions;
  END IF;
END $$;