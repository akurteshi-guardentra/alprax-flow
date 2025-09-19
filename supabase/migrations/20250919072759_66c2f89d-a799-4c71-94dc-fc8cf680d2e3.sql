-- Fix RLS policies for business intelligence data
-- These tables should only be accessible to authenticated users

-- Update feature_tiers to require authentication
DROP POLICY IF EXISTS "Allow users to view feature tiers" ON public.feature_tiers;
CREATE POLICY "Authenticated users can view feature tiers" 
ON public.feature_tiers 
FOR SELECT 
TO authenticated
USING (true);

-- Update early_access_features to require authentication  
DROP POLICY IF EXISTS "Allow users to view features" ON public.early_access_features;
CREATE POLICY "Authenticated users can view early access features" 
ON public.early_access_features 
FOR SELECT 
TO authenticated
USING (true);

-- Fix remittance_rates policy to be more specific
DROP POLICY IF EXISTS "Allow public read access to remittance rates" ON public.remittance_rates;
CREATE POLICY "Authenticated users can view remittance rates" 
ON public.remittance_rates 
FOR SELECT 
TO authenticated
USING (true);