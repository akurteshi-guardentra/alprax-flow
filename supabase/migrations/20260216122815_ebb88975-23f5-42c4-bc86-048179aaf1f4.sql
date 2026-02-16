
-- Secure find_user_by_email: require exact match (no ILIKE wildcards) and add basic validation
CREATE OR REPLACE FUNCTION public.find_user_by_email(search_email text)
RETURNS TABLE(user_id uuid, email text, has_stellar_account boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate email format (basic check)
  IF search_email IS NULL OR length(search_email) < 5 OR length(search_email) > 255 
     OR search_email NOT LIKE '%@%.%' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Reject wildcard patterns to prevent enumeration
  IF search_email LIKE '%\%%' OR search_email LIKE '%\_%' THEN
    RAISE EXCEPTION 'Wildcards not allowed in email search';
  END IF;

  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Log the search for audit purposes
  PERFORM public.log_sensitive_operation('user_email_search', 'auth.users');

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    (sa.id IS NOT NULL) as has_stellar_account
  FROM auth.users u
  LEFT JOIN stellar_accounts sa ON u.id = sa.user_id
  WHERE u.email = search_email  -- Exact match only, no ILIKE
  AND u.id != auth.uid();
END;
$$;

-- Secure cleanup function: only callable by service role (no auth.uid())
CREATE OR REPLACE FUNCTION public.cleanup_old_completed_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service role (auth.uid() is NULL for service role calls)
  IF auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'This function can only be called by the service role';
  END IF;

  DELETE FROM public.orders 
  WHERE status = 'completed' 
  AND created_at < NOW() - INTERVAL '1 year';
END;
$$;
