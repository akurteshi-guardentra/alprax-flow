import { useState } from 'react';
import { FundingIntegrationService } from '@/services/FundingIntegrationService';
import { toast } from 'sonner';

export function useFundingIntegration() {
  const [isProcessing, setIsProcessing] = useState(false);

  const createPaymentIntent = async (amountCents: number) => {
    try {
      setIsProcessing(true);
      const paymentIntent = await FundingIntegrationService.createFundingPaymentIntent(amountCents);
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to initialize payment');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async (paymentIntentId: string, orderId: string, amountCents: number) => {
    try {
      setIsProcessing(true);
      const result = await FundingIntegrationService.processSuccessfulFunding(
        paymentIntentId, 
        orderId, 
        amountCents
      );
      return result;
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment processing failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const getFundingHistory = async () => {
    try {
      return await FundingIntegrationService.getFundingHistory();
    } catch (error) {
      console.error('Error fetching funding history:', error);
      return [];
    }
  };

  return {
    createPaymentIntent,
    processPayment,
    getFundingHistory,
    isProcessing
  };
}