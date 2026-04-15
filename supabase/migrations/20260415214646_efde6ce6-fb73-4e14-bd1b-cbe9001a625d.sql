-- Fix 1: Add auth.uid() check to get_user_primary_stellar_account
CREATE OR REPLACE FUNCTION public.get_user_primary_stellar_account(user_uuid uuid)
RETURNS TABLE(id uuid, public_key text, encrypted_secret text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
    SELECT sa.id, sa.public_key, sa.encrypted_secret, sa.created_at
    FROM public.stellar_accounts sa
    WHERE sa.user_id = user_uuid
    ORDER BY sa.is_primary DESC NULLS LAST, sa.created_at DESC
    LIMIT 1;
END;
$$;

-- Fix 2: Drop overly permissive orders policy
DROP POLICY IF EXISTS "System can manage orders" ON public.orders;

-- Fix 3: Drop overly permissive transfer_impact_metrics public insert policy
DROP POLICY IF EXISTS "System can insert impact metrics" ON public.transfer_impact_metrics;