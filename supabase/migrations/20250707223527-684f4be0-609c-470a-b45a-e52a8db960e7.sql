-- Clean up duplicate Stellar accounts and fix issues
-- First, update the payment_errors table to allow updates for error resolution
DROP POLICY IF EXISTS "Users can view their own payment errors" ON payment_errors;
DROP POLICY IF EXISTS "Users can insert their own payment errors" ON payment_errors;

CREATE POLICY "Users can manage their own payment errors" 
ON payment_errors FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Clean up duplicate Stellar accounts - keep only the most recent primary account per user
DELETE FROM stellar_accounts 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM stellar_accounts 
  ORDER BY user_id, is_primary DESC NULLS LAST, created_at DESC
);

-- Ensure each user has exactly one primary account
UPDATE stellar_accounts 
SET is_primary = true 
WHERE id IN (
  SELECT DISTINCT ON (user_id) id 
  FROM stellar_accounts 
  ORDER BY user_id, created_at DESC
);

-- Add index for better performance on account lookups
CREATE INDEX IF NOT EXISTS idx_stellar_accounts_user_primary 
ON stellar_accounts (user_id, is_primary, created_at DESC);

-- Add index for payment queue processing
CREATE INDEX IF NOT EXISTS idx_transaction_queue_processing 
ON transaction_queue (status, priority DESC, created_at ASC)
WHERE status IN ('pending', 'processing');

-- Create a function to get user's primary stellar account
CREATE OR REPLACE FUNCTION get_user_primary_stellar_account(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  public_key TEXT,
  encrypted_secret TEXT,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE SQL
AS $$
  SELECT sa.id, sa.public_key, sa.encrypted_secret, sa.created_at
  FROM stellar_accounts sa
  WHERE sa.user_id = user_uuid
  ORDER BY sa.is_primary DESC NULLS LAST, sa.created_at DESC
  LIMIT 1;
$$;