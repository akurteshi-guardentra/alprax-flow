
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFundingIntegration } from '@/hooks/useFundingIntegration';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
}

interface PaymentMethodSelectorProps {
  onSelect: (method: string) => void;
  selected: string;
  amount: number; // Amount in cents
  onPaymentComplete: () => void;
}

export function PaymentMethodSelector({ 
  onSelect, 
  selected, 
  amount, 
  onPaymentComplete 
}: PaymentMethodSelectorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createPaymentIntent, processPayment, isProcessing: flowProcessing } = useFundingIntegration();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Visa, Mastercard, American Express',
      enabled: true
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Pay with Touch ID or Face ID',
      enabled: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: <Building className="h-5 w-5" />,
      description: 'Direct bank account transfer',
      enabled: false // Disabled for now
    }
  ];

  const handlePaymentMethodSelect = (methodId: string) => {
    onSelect(methodId);
  };

  const handleProcessPayment = async () => {
    if (!selected) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create payment intent
      const paymentIntent = await createPaymentIntent(amount);
      if (!paymentIntent) {
        toast.error('Failed to initialize payment');
        return;
      }

      // Simulate payment processing based on selected method
      if (selected === 'card') {
        toast.loading('Processing card payment...', { id: 'payment-processing' });
        // Simulate card payment flow - in real app this would open Stripe Elements
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else if (selected === 'apple_pay') {
        toast.loading('Processing Apple Pay...', { id: 'payment-processing' });
        // Simulate Apple Pay flow
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Process the payment and add funds to account
      const result = await processPayment(
        paymentIntent.paymentIntentId, 
        paymentIntent.orderId, 
        amount
      );
      
      toast.dismiss('payment-processing');
      
      if (result && result.success) {
        onPaymentComplete();
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.dismiss('payment-processing');
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isProcessing || flowProcessing;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <motion.div
            key={method.id}
            whileHover={{ scale: method.enabled ? 1.02 : 1 }}
            whileTap={{ scale: method.enabled ? 0.98 : 1 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-200 ${
                method.enabled 
                  ? selected === method.id 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                  : 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => method.enabled && handlePaymentMethodSelect(method.id)}
            >
              <CardContent className="flex items-center space-x-3 p-4">
                <div className={`${method.enabled ? 'text-white' : 'text-white/50'}`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${method.enabled ? 'text-white' : 'text-white/50'}`}>
                    {method.name}
                  </div>
                  <div className={`text-sm ${method.enabled ? 'text-white/70' : 'text-white/30'}`}>
                    {method.description}
                  </div>
                </div>
                {selected === method.id && method.enabled && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
                {!method.enabled && (
                  <div className="text-xs text-white/50 font-medium">
                    Coming Soon
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <Button
            onClick={handleProcessPayment}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing Payment...
              </>
            ) : (
              `Pay $${(amount / 100).toFixed(2)}`
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
