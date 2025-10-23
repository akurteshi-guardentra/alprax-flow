-- Fix security warnings: Set search_path on new functions to prevent SQL injection

-- Fix generate_user_account_id function
CREATE OR REPLACE FUNCTION generate_user_account_id()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_account_id IS NULL THEN
    NEW.user_account_id := 'ALF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

-- Fix generate_confirmation_id function
CREATE OR REPLACE FUNCTION generate_confirmation_id()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.confirmation_id IS NULL AND NEW.stellar_tx_hash IS NOT NULL THEN
    NEW.confirmation_id := 'CNF-' || UPPER(SUBSTRING(NEW.stellar_tx_hash FROM 1 FOR 10));
  END IF;
  RETURN NEW;
END;
$$;