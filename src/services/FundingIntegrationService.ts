import { supabase } from '@/integrations/supabase/client';
import { StripePaymentService } from './StripePaymentService';
import { toast } from 'sonner';

export class FundingIntegrationService {
  /**
   * Create a payment intent for funding account
   */
  static async createFundingPaymentIntent(amountCents: number, description = 'Add funds to account') {
    try {
      const paymentIntent = await StripePaymentService.createPaymentIntent(
        amountCents,
        'usd',
        description,
        { type: 'account_funding' }
      );

      if (!paymentIntent) {
        throw new Error('Failed to create payment intent');
      }

      return paymentIntent;
    } catch (error) {
      console.error('Error creating funding payment intent:', error);
      throw error;
    }
  }

  /**
   * Process successful payment and add funds to user's account
   */
  static async processSuccessfulFunding(paymentIntentId: string, orderId: string, amountCents: number) {
    try {
      // First confirm the payment with Stripe
      const paymentResult = await StripePaymentService.confirmPayment(paymentIntentId, orderId);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment confirmation failed');
      }

      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Create a funding transaction record
      const stellarAmount = FundingIntegrationService.convertUsdToXlm(amountCents / 100); // Convert cents to dollars, then to XLM
      
      const { error: transactionError } = await supabase
        .from('stellar_transactions')
        .insert({
          user_id: user.user.id,
          stellar_tx_hash: `stripe_funding_${paymentIntentId}`,
          transaction_type: 'payment',
          from_asset: 'USD',
          to_asset: 'XLM',
          amount: stellarAmount,
          fee: 0,
          status: 'completed',
          completed_at: new Date().toISOString(),
          memo: `Stripe funding: $${(amountCents / 100).toFixed(2)}`
        });

      if (transactionError) {
        console.error('Error creating transaction record:', transactionError);
        throw transactionError;
      }

      toast.success(`Successfully added $${(amountCents / 100).toFixed(2)} to your account!`);
      
      return {
        success: true,
        amount: stellarAmount,
        currency: 'XLM'
      };
    } catch (error) {
      console.error('Error processing successful funding:', error);
      toast.error('Failed to process funding. Please contact support.');
      throw error;
    }
  }

  /**
   * Convert USD to XLM (demo conversion rate)
   */
  private static convertUsdToXlm(usdAmount: number): number {
    // Demo conversion rate: 1 USD = 10 XLM (for testing purposes)
    return usdAmount * 10;
  }

  /**
   * Get funding transaction history
   */
  static async getFundingHistory() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('stellar_transactions')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('from_asset', 'USD')
        .eq('to_asset', 'XLM')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching funding history:', error);
      return [];
    }
  }
}