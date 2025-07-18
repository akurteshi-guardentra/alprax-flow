import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentStatus {
  orderId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount?: number;
  currency?: string;
  updatedAt: string;
}

/**
 * Hook for real-time payment status updates
 */
export function useRealTimePaymentStatus(orderId?: string) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPaymentStatus = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching payment status:', error);
        return;
      }

      if (data) {
        setPaymentStatus({
          orderId: data.id,
          status: data.status,
          amount: data.amount / 100, // Convert from cents
          currency: data.currency,
          updatedAt: data.updated_at
        });
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!orderId) return;

    // Initial fetch
    fetchPaymentStatus(orderId);

    // Set up real-time subscription
    const channel = supabase
      .channel('payment-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Payment status updated:', payload);
          const newData = payload.new as any;
          
          setPaymentStatus({
            orderId: newData.id,
            status: newData.status,
            amount: newData.amount / 100,
            currency: newData.currency,
            updatedAt: newData.updated_at
          });

          // Show toast notification for status changes
          if (newData.status === 'completed') {
            toast.success('Payment completed successfully!');
          } else if (newData.status === 'failed') {
            toast.error('Payment failed. Please try again.');
          } else if (newData.status === 'processing') {
            toast.info('Payment is being processed...');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, fetchPaymentStatus]);

  return {
    paymentStatus,
    isLoading,
    refetch: orderId ? () => fetchPaymentStatus(orderId) : undefined
  };
}