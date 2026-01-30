-- Fix overly permissive RLS policy on orders table
-- Drop the policy that allows unrestricted access with USING (true)
DROP POLICY IF EXISTS "System can manage orders" ON public.orders;

-- Create a restricted policy for service role only (for edge functions)
CREATE POLICY "Service role can manage all orders" ON public.orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);