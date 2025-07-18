import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StripePaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  orderId: string;
}

export interface PaymentResult {
  success: boolean;
  status?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  error?: string;
}

export class StripePaymentService {
  /**
   * Create a payment intent using Supabase edge function
   */
  static async createPaymentIntent(
    amount: number,
    currency = 'usd',
    description?: string,
    metadata?: Record<string, string>
  ): Promise<StripePaymentIntent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount,
          currency,
          description,
          metadata
        }
      });

      if (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(error.message || 'Failed to create payment intent');
      }

      if (!data?.clientSecret || !data?.paymentIntentId || !data?.orderId) {
        throw new Error('Invalid response from payment service');
      }

      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
        orderId: data.orderId
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      const message = error instanceof Error ? error.message : 'Failed to create payment intent';
      toast.error(message);
      return null;
    }
  }

  /**
   * Confirm payment using Supabase edge function
   */
  static async confirmPayment(
    paymentIntentId: string,
    orderId: string
  ): Promise<PaymentResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: {
          paymentIntentId,
          orderId
        }
      });

      if (error) {
        console.error('Error confirming payment:', error);
        throw new Error(error.message || 'Failed to confirm payment');
      }

      if (!data) {
        throw new Error('Invalid response from payment service');
      }

      return {
        success: data.success || false,
        status: data.status,
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        error: data.error
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      const message = error instanceof Error ? error.message : 'Failed to confirm payment';
      return {
        success: false,
        error: message
      };
    }
  }

  /**
   * Get user's orders/payment history
   */
  static async getPaymentHistory(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }
}