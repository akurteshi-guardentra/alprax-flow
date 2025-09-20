import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { StripeCardPaymentWrapper } from '@/components/payment/StripeCardPayment';
import { useFundingIntegration } from '@/hooks/useFundingIntegration';
import { toast } from 'sonner';

interface PaymentMethodStepProps {
  data: Record<string, any>;
  onNext: (data?: any) => void;
  onBack: () => void;
}

export function PaymentMethodStep({ data, onNext, onBack }: PaymentMethodStepProps) {
  const [selectedMethod, setSelectedMethod] = useState(data.paymentMethod || 'stellar');
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string>('');
  
  const { createPaymentIntent, processPayment, isProcessing } = useFundingIntegration();

  const handleNext = async () => {
    if (selectedMethod === 'card') {
      await handleCardPayment();
    } else {
      // For Stellar payments, proceed directly
      onNext({ 
        paymentMethod: selectedMethod, 
        status: 'ready_to_process',
        amount: data.amount,
        recipient: data.recipient
      });
    }
  };

  const handleCardPayment = async () => {
    try {
      const amount = parseFloat(data.amount) * 100; // Convert to cents
      const paymentIntent = await createPaymentIntent(amount);
      
      if (paymentIntent?.clientSecret) {
        setStripeClientSecret(paymentIntent.clientSecret);
        setShowStripePayment(true);
      }
    } catch (error) {
      toast.error('Failed to initialize card payment');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const amount = parseFloat(data.amount) * 100;
      const orderId = `order_${Date.now()}`;
      
      await processPayment(paymentIntentId, orderId, amount);
      onNext({ 
        paymentMethod: 'card', 
        status: 'completed',
        paymentIntentId,
        orderId 
      });
    } catch (error) {
      toast.error('Payment processing failed');
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    setShowStripePayment(false);
  };

  if (showStripePayment && stripeClientSecret) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Complete Payment</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStripePayment(false)}
            className="text-white/70 hover:text-white"
          >
            Back
          </Button>
        </div>
        
        <StripeCardPaymentWrapper
          clientSecret={stripeClientSecret}
          amount={parseFloat(data.amount || '0')}
          currency="usd"
          onSuccess={() => { 
            setShowStripePayment(false);
            onNext({ paymentMethod: 'card', status: 'completed' });
          }}
          onError={handlePaymentError}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Choose Payment Method</h3>
        <p className="text-white/70">How would you like to complete this payment?</p>
        {data.amount && (
          <p className="text-2xl font-bold text-white mt-2">
            ${parseFloat(data.amount).toFixed(2)}
          </p>
        )}
      </div>

      <PaymentMethodSelector
        selectedMethod={selectedMethod}
        onMethodSelect={setSelectedMethod}
      />

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={isProcessing}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          {isProcessing ? 'Processing...' : selectedMethod === 'card' ? 'Pay with Card' : 'Continue'}
        </Button>
      </div>
    </motion.div>
  );
}