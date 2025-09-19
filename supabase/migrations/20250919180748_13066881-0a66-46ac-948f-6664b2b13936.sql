-- Security Enhancement: Restrict Business Intelligence Data Access
-- Replace overly permissive RLS policies with authenticated-user-only access

-- Update feature_tiers policy
DROP POLICY IF EXISTS "Authenticated users can view feature tiers" ON public.feature_tiers;
CREATE POLICY "Authenticated users can view feature tiers" 
ON public.feature_tiers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update exchange_rates policies
DROP POLICY IF EXISTS "Allow users to view exchange rates" ON public.exchange_rates;
DROP POLICY IF EXISTS "Exchange rates are readable by authenticated users" ON public.exchange_rates;
CREATE POLICY "Authenticated users can view exchange rates" 
ON public.exchange_rates 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update remittance_rates policy
DROP POLICY IF EXISTS "Authenticated users can view remittance rates" ON public.remittance_rates;
CREATE POLICY "Authenticated users can view remittance rates" 
ON public.remittance_rates 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update fee_structure policy
DROP POLICY IF EXISTS "Fee structure visible to authenticated users" ON public.fee_structure;
CREATE POLICY "Authenticated users can view fee structure" 
ON public.fee_structure 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update reward_tiers policies
DROP POLICY IF EXISTS "manage_reward_tiers" ON public.reward_tiers;
DROP POLICY IF EXISTS "select_reward_tiers" ON public.reward_tiers;
CREATE POLICY "Authenticated users can view reward tiers" 
ON public.reward_tiers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update early_access_features policy
DROP POLICY IF EXISTS "Authenticated users can view early access features" ON public.early_access_features;
CREATE POLICY "Authenticated users can view early access features" 
ON public.early_access_features 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Security hardening: Add audit logging function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operation(operation_type text, table_name text, record_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log sensitive operations to PostgreSQL log
  RAISE LOG 'AUDIT: User % performed % on % with record %', 
    auth.uid(), operation_type, table_name, record_id;
END;
$$;