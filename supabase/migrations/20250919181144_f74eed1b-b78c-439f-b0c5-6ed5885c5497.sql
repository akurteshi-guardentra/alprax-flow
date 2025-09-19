-- Fix function search path security warnings
-- Set explicit search_path for all functions that don't have it

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Fix get_user_primary_stellar_account function
CREATE OR REPLACE FUNCTION public.get_user_primary_stellar_account(user_uuid uuid)
RETURNS TABLE(id uuid, public_key text, encrypted_secret text, created_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sa.id, sa.public_key, sa.encrypted_secret, sa.created_at
  FROM public.stellar_accounts sa
  WHERE sa.user_id = user_uuid
  ORDER BY sa.is_primary DESC NULLS LAST, sa.created_at DESC
  LIMIT 1;
$$;

-- Fix cleanup_old_completed_orders function 
CREATE OR REPLACE FUNCTION public.cleanup_old_completed_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Archive orders older than 1 year that are completed
  DELETE FROM public.orders 
  WHERE status = 'completed' 
  AND created_at < NOW() - INTERVAL '1 year';
END;
$$;