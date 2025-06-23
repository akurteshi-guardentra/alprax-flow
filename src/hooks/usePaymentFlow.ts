
import { useState } from 'react';
import { PaymentService, PaymentIntent } from '@/services/PaymentService';
import { useStellarAccount } from '@/hooks/useStellarAccount';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';

export function usePaymentFlow() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPaymentIntent, setCurrentPaymentIntent] = useState<PaymentIntent | null>(null);
  const { refreshBalance } = useStellarAccount();

  const createPaymentIntent = async (amountCents: number): Promise<PaymentIntent | null> => {
    try {
      setIsProcessing(true);
      const paymentIntent = await PaymentService.createPaymentIntent(amountCents);
      setCurrentPaymentIntent(paymentIntent);
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to initialize payment');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPayment = async (paymentIntentId?: string): Promise<boolean> => {
    const intentId = paymentIntentId || currentPaymentIntent?.id;
    if (!intentId) {
      toast.error('No payment to confirm');
      return false;
    }

    try {
      setIsProcessing(true);
      hapticFeedback('medium');
      
      const success = await PaymentService.confirmPayment(intentId);
      
      if (success) {
        hapticFeedback('success');
        // Refresh the user's balance after successful payment
        setTimeout(() => {
          refreshBalance();
        }, 1000);
        setCurrentPaymentIntent(null);
      } else {
        hapticFeedback('error');
      }
      
      return success;
    } catch (error) {
      console.error('Error confirming payment:', error);
      hapticFeedback('error');
      toast.error('Payment confirmation failed');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setCurrentPaymentIntent(null);
    setIsProcessing(false);
  };

  return {
    isProcessing,
    currentPaymentIntent,
    createPaymentIntent,
    confirmPayment,
    resetPayment
  };
}
