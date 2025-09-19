-- Create test users for multi-user testing
-- Insert test users if they don't exist

-- Insert test user profiles (these will be created via auth signup in the app)
-- For now, just create the favorite recipients that can be used for testing

-- Clear existing test data first to avoid conflicts
DELETE FROM public.favorite_recipients WHERE recipient_name IN ('Alice Johnson', 'Bob Smith', 'Carol Martinez', 'David Weber');

-- Insert test recipients for cross-user testing
-- Note: These will need to be properly associated with real user IDs after users are created via auth
INSERT INTO public.favorite_recipients (
  id,
  user_id,
  recipient_name,
  stellar_address,
  country,
  currency,
  relationship,
  created_at
) VALUES 
-- Recipients for Alice (will be updated with real user_id later)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bob Smith', 'GBFLT4E5RW6MDMZ7VWVGHX5HYJKDMQFSYUCT5EIIBUB3GWVSIGKPAPYT', 'Kosovo', 'EUR', 'Family', now()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Carol Martinez', 'GCDHJJ3UHZVLHSQC7Z5C4D5T4T7AI2M2LKSDYQOEH7HVHWB4ZGHRCMGD', 'Albania', 'EUR', 'Friend', now()),

-- Recipients for David (will be updated with real user_id later)  
(gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'Bob Smith', 'GBFLT4E5RW6MDMZ7VWVGHX5HYJKDMQFSYUCT5EIIBUB3GWVSIGKPAPYT', 'Kosovo', 'EUR', 'Business Contact', now()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'Carol Martinez', 'GCDHJJ3UHZVLHSQC7Z5C4D5T4T7AI2M2LKSDYQOEH7HVHWB4ZGHRCMGD', 'Albania', 'EUR', 'Family', now())

ON CONFLICT (id) DO NOTHING;

-- Create a function to help setup test users with proper relationships
CREATE OR REPLACE FUNCTION public.setup_test_user_relationships()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alice_id uuid;
  bob_id uuid;
  carol_id uuid;
  david_id uuid;
BEGIN
  -- This function will be called after test users are created via auth
  -- to establish proper relationships between users and recipients
  
  RAISE LOG 'Test user relationships setup function created. Call this after creating auth users.';
END;
$$;