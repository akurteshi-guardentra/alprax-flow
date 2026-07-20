-- Harden SECURITY DEFINER functions: convert to SECURITY INVOKER where policies suffice,
-- and revoke authenticated EXECUTE from the one that still needs DEFINER (auth.users access)
-- since it will be replaced by an edge function.

-- has_role: used in RLS with auth.uid(); users can read their own user_roles row via RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- get_user_primary_stellar_account: RLS on stellar_accounts already restricts to owner
CREATE OR REPLACE FUNCTION public.get_user_primary_stellar_account(user_uuid uuid)
RETURNS TABLE(id uuid, public_key text, encrypted_secret text, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
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

-- find_user_by_email: requires auth.users access (DEFINER-only). Revoke from authenticated;
-- the client will call an edge function that runs with the service role instead.
REVOKE EXECUTE ON FUNCTION public.find_user_by_email(text) FROM authenticated;