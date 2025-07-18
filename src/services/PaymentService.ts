
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentIntent {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FundingTransaction {
  id: string;
  user_id: string;
  payment_intent_id?: string;
  amount_usd: number;
  amount_xlm?: number;
  exchange_rate?: number;
  status: string;
  stellar_tx_hash?: string;
  error_message?: string;
  completed_at?: string;
  created_at: string;
}

export interface TestCard {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
}

export class PaymentService {
  
  /**
   * Create a payment intent for funding account - now uses real Stripe integration
   */
  static async createPaymentIntent(amountCents: number): Promise<PaymentIntent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: amountCents / 100, // Convert cents to dollars for edge function
          currency: 'usd',
          description: 'Account funding via Alprax Flow',
          metadata: {
            purpose: 'account_funding',
            created_by: 'payment_service'
          }
        }
      });

      if (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(error.message || 'Failed to create payment intent');
      }

      // Map the response to our PaymentIntent interface
      const paymentIntent: PaymentIntent = {
        id: data.orderId,
        user_id: user.id,
        stripe_payment_intent_id: data.paymentIntentId,
        amount: amountCents,
        currency: 'usd',
        status: 'requires_payment_method',
        client_secret: data.clientSecret,
        metadata: {
          purpose: 'account_funding',
          created_by: 'payment_service'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to create payment intent');
      return null;
    }
  }

  /**
   * Confirm payment and process funding - now uses real Stripe integration
   */
  static async confirmPayment(paymentIntentId: string, orderId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Use the new edge function to confirm payment
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: {
          paymentIntentId,
          orderId: orderId || paymentIntentId
        }
      });

      if (error) {
        console.error('Error confirming payment:', error);
        throw new Error(error.message || 'Payment confirmation failed');
      }

      if (data.success) {
        toast.success(`Successfully added $${data.amount} to your account!`);
        return true;
      } else {
        throw new Error(data.error || 'Payment was not successful');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      const message = error instanceof Error ? error.message : 'Payment confirmation failed';
      toast.error(message);
      return false;
    }
  }

  /**
   * Get user's funding transactions
   */
  static async getFundingTransactions(): Promise<FundingTransaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('funding_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FundingTransaction[];
    } catch (error) {
      console.error('Error fetching funding transactions:', error);
      return [];
    }
  }

  /**
   * Get payment intent by ID
   */
  static async getPaymentIntent(id: string): Promise<PaymentIntent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as PaymentIntent;
    } catch (error) {
      console.error('Error fetching payment intent:', error);
      return null;
    }
  }

  /**
   * Process payment with Stripe - deprecated, use StripePaymentService instead
   */
  static async processPayment(clientSecret: string, paymentMethod: any): Promise<PaymentResult> {
    console.warn('PaymentService.processPayment is deprecated. Use StripePaymentService.confirmPayment instead.');
    
    try {
      // For backward compatibility, return success
      // Real implementation should use Stripe Elements and confirmPayment
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Payment processing failed' };
    }
  }

  /**
   * Get test cards for development
   */
  static getTestCards(): TestCard[] {
    return [
      {
        name: 'Visa Success',
        number: '4242 4242 4242 4242',
        expiry: '12/28',
        cvc: '123'
      },
      {
        name: 'Visa Declined',
        number: '4000 0000 0000 0002',
        expiry: '12/28',
        cvc: '123'
      },
      {
        name: 'Mastercard Success',
        number: '5555 5555 5555 4444',
        expiry: '12/28',
        cvc: '123'
      },
      {
        name: 'American Express',
        number: '3782 822463 10005',
        expiry: '12/28',
        cvc: '1234'
      }
    ];
  }
}
