-- Phase 1: Database Cleanup (Step by step)

-- First, clean up duplicate primary accounts
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

-- Now create the unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_stellar_accounts_user_primary 
ON stellar_accounts (user_id) 
WHERE is_primary = true;