-- Phase 3: Add abstraction layer columns to support fiat-centric UX

-- 1. Add user preferences to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'USD' CHECK (preferred_currency IN ('USD', 'EUR', 'GBP')),
ADD COLUMN IF NOT EXISTS show_crypto_details BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user_account_id TEXT UNIQUE;

-- Create index on user_account_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_account_id ON profiles(user_account_id);

-- Generate user-friendly account IDs for existing users (ALF-XXXXXXXX format)
UPDATE profiles 
SET user_account_id = 'ALF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 8))
WHERE user_account_id IS NULL;

COMMENT ON COLUMN profiles.preferred_currency IS 'User preferred currency for display (USD, EUR, GBP)';
COMMENT ON COLUMN profiles.show_crypto_details IS 'Whether to show blockchain details to user (advanced mode)';
COMMENT ON COLUMN profiles.user_account_id IS 'User-friendly account identifier (ALF-XXXXXXXX)';

-- 2. Add fiat tracking columns to stellar_transactions
ALTER TABLE stellar_transactions
ADD COLUMN IF NOT EXISTS fiat_amount NUMERIC,
ADD COLUMN IF NOT EXISTS fiat_currency TEXT DEFAULT 'USD' CHECK (fiat_currency IN ('USD', 'EUR', 'GBP')),
ADD COLUMN IF NOT EXISTS exchange_rate_at_time NUMERIC,
ADD COLUMN IF NOT EXISTS confirmation_id TEXT UNIQUE;

-- Create index on confirmation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_stellar_transactions_confirmation_id ON stellar_transactions(confirmation_id);

-- Generate confirmation IDs for existing transactions (CNF-XXXXXXXXXX format)
UPDATE stellar_transactions 
SET confirmation_id = 'CNF-' || UPPER(SUBSTRING(stellar_tx_hash FROM 1 FOR 10))
WHERE confirmation_id IS NULL AND stellar_tx_hash IS NOT NULL;

COMMENT ON COLUMN stellar_transactions.fiat_amount IS 'Transaction amount in fiat currency (for user display)';
COMMENT ON COLUMN stellar_transactions.fiat_currency IS 'Fiat currency used at time of transaction';
COMMENT ON COLUMN stellar_transactions.exchange_rate_at_time IS 'XLM/Fiat exchange rate when transaction occurred';
COMMENT ON COLUMN stellar_transactions.confirmation_id IS 'User-friendly confirmation ID (CNF-XXXXXXXXXX)';

-- 3. Create function to automatically generate user account ID on profile creation
CREATE OR REPLACE FUNCTION generate_user_account_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_account_id IS NULL THEN
    NEW.user_account_id := 'ALF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate account ID
DROP TRIGGER IF EXISTS set_user_account_id ON profiles;
CREATE TRIGGER set_user_account_id
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_user_account_id();

-- 4. Create function to automatically generate confirmation ID on transaction creation
CREATE OR REPLACE FUNCTION generate_confirmation_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_id IS NULL AND NEW.stellar_tx_hash IS NOT NULL THEN
    NEW.confirmation_id := 'CNF-' || UPPER(SUBSTRING(NEW.stellar_tx_hash FROM 1 FOR 10));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate confirmation ID
DROP TRIGGER IF EXISTS set_confirmation_id ON stellar_transactions;
CREATE TRIGGER set_confirmation_id
  BEFORE INSERT OR UPDATE ON stellar_transactions
  FOR EACH ROW
  EXECUTE FUNCTION generate_confirmation_id();