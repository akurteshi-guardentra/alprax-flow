
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

export class PaymentService {
  
  /**
   * Create a payment intent for funding account
   */
  static async createPaymentIntent(amountCents: number): Promise<PaymentIntent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // For now, create a mock payment intent in our database
      // This will be replaced with real Stripe API call later
      const mockStripeId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('payment_intents')
        .insert({
          user_id: user.id,
          stripe_payment_intent_id: mockStripeId,
          amount: amountCents,
          currency: 'usd',
          status: 'requires_payment_method',
          client_secret: `${mockStripeId}_secret_mock`,
          metadata: {
            purpose: 'account_funding',
            created_by: 'payment_service'
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data as PaymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to create payment intent');
      return null;
    }
  }

  /**
   * Confirm payment and process funding
   */
  static async confirmPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get payment intent
      const { data: paymentIntent, error: intentError } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('id', paymentIntentId)
        .eq('user_id', user.id)
        .single();

      if (intentError || !paymentIntent) {
        throw new Error('Payment intent not found');
      }

      // Mock successful payment confirmation
      // In real implementation, this would call Stripe API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

      // Update payment intent status
      await supabase
        .from('payment_intents')
        .update({ 
          status: 'succeeded',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentIntentId);

      // Create funding transaction
      const exchangeRate = 0.087; // Mock XLM/USD rate - in real app, fetch from API
      const amountUsd = paymentIntent.amount / 100; // Convert cents to dollars
      const amountXlm = amountUsd / exchangeRate;

      const { data: fundingTx, error: fundingError } = await supabase
        .from('funding_transactions')
        .insert({
          user_id: user.id,
          payment_intent_id: paymentIntentId,
          amount_usd: amountUsd,
          amount_xlm: amountXlm,
          exchange_rate: exchangeRate,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (fundingError) throw fundingError;

      // Record the funding in stellar_transactions table for consistency
      await supabase
        .from('stellar_transactions')
        .insert({
          user_id: user.id,
          stellar_tx_hash: `funding_${fundingTx.id}`,
          transaction_type: 'funding',
          from_asset: 'USD',
          to_asset: 'XLM',
          amount: amountXlm,
          fee: 0,
          status: 'completed',
          memo: `Account funding: $${amountUsd}`,
          recipient_name: 'My Account',
          completed_at: new Date().toISOString()
        });

      toast.success(`Successfully added $${amountUsd} to your account!`);
      return true;
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Payment confirmation failed');
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
}
