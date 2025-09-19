-- Fix alpraxreciver@example.com missing Stellar account
INSERT INTO public.stellar_accounts (
  user_id,
  public_key,
  encrypted_secret,
  is_primary,
  account_name
) VALUES (
  'b44ddaac-32e5-48c6-ab60-2517251a8062',
  'GBQELWZLOWGFBH5DG4ZR7EQWOGPDQ4Y6XZXF5MQJH6VCLHXPBZZNHCLO',
  'encrypted_secret_placeholder_for_demo',
  true,
  'Primary Account'
) ON CONFLICT DO NOTHING;

-- Add receiver to sender's favorite recipients
INSERT INTO public.favorite_recipients (
  user_id,
  recipient_name,
  stellar_address,
  country,
  currency,
  relationship,
  created_at
) VALUES (
  '47c60d81-4987-4966-8427-3850d95cdae4',
  'Alex Receiver',
  'GBQELWZLOWGFBH5DG4ZR7EQWOGPDQ4Y6XZXF5MQJH6VCLHXPBZZNHCLO',
  'Germany',
  'EUR',
  'Friend',
  now()
) ON CONFLICT DO NOTHING;

-- Create demo funding transaction for receiver
INSERT INTO public.stellar_transactions (
  user_id,
  stellar_tx_hash,
  transaction_type,
  from_asset,
  to_asset,
  amount,
  fee,
  status,
  created_at,
  completed_at,
  memo
) VALUES (
  'b44ddaac-32e5-48c6-ab60-2517251a8062',
  'demo_funding_' || gen_random_uuid()::text,
  'funding',
  'XLM',
  'XLM',
  10000,
  0,
  'completed',
  now(),
  now(),
  'Demo account funding'
);

-- Create function for user discovery by email
CREATE OR REPLACE FUNCTION public.find_user_by_email(search_email text)
RETURNS TABLE(user_id uuid, email text, has_stellar_account boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id,
    u.email,
    (sa.id IS NOT NULL) as has_stellar_account
  FROM auth.users u
  LEFT JOIN stellar_accounts sa ON u.id = sa.user_id
  WHERE u.email ILIKE search_email
  AND u.id != auth.uid(); -- Don't return current user
$$;