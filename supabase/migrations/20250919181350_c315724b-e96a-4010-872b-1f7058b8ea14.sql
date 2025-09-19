-- Fix remaining function search path issues
-- Update update_updated_at_column function and log_sensitive_operation function

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix log_sensitive_operation function 
CREATE OR REPLACE FUNCTION public.log_sensitive_operation(operation_type text, table_name text, record_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log sensitive operations to PostgreSQL log
  RAISE LOG 'AUDIT: User % performed % on % with record %', 
    auth.uid(), operation_type, table_name, record_id;
END;
$$;