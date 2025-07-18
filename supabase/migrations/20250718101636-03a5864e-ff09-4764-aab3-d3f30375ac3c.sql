-- Add database optimizations for high-load scenarios (without CONCURRENTLY)

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_orders_user_id_status 
ON public.orders (user_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON public.orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id 
ON public.orders (stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id_status 
ON public.payment_intents (user_id, status);

CREATE INDEX IF NOT EXISTS idx_funding_transactions_user_id_status 
ON public.funding_transactions (user_id, status);

CREATE INDEX IF NOT EXISTS idx_stellar_transactions_user_id_status 
ON public.stellar_transactions (user_id, status);

-- Add partial indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_pending_payments 
ON public.orders (created_at) 
WHERE status IN ('pending', 'processing');

-- Enable realtime for orders table for payment status updates
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Create a function to clean up old completed orders (optional)
CREATE OR REPLACE FUNCTION cleanup_old_completed_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Archive orders older than 1 year that are completed
  DELETE FROM public.orders 
  WHERE status = 'completed' 
  AND created_at < NOW() - INTERVAL '1 year';
END;
$$;

-- Add trigger to orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_orders_updated_at'
  ) THEN
    CREATE TRIGGER update_orders_updated_at
      BEFORE UPDATE ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;