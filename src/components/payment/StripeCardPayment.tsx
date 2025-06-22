
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { processPayment } from '@/services/StripePaymentService';
import { motion } from 'framer-motion';

interface StripeCardPaymentProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function StripeCardPayment({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError
}: StripeCardPaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: cardError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (cardError) {
        throw new Error(cardError.message || 'An error occurred with your card');
      }

      const result = await processPayment(clientSecret, paymentMethod);

      if (result.success) {
        setSucceeded(true);
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        // Handle the case where success is false but no error property exists
        throw new Error('Payment failed - please try again');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An unexpected error occurred');
      onError(err.message || 'An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    
    return formatter.format(amount / 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <div className="mb-3">
          <label className="text-white text-sm font-medium mb-1 block">
            Card Details
          </label>
          <div className="p-2 bg-slate-900/50 rounded border border-slate-700/50">
            <CardElement
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: '14px',
                    color: '#ffffff',
                    '::placeholder': {
                      color: 'rgba(255, 255, 255, 0.6)',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <Alert className="bg-red-900/20 border-red-800/30 text-red-200 mb-3">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {succeeded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <Alert className="bg-green-900/20 border-green-800/30 text-green-200">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-xs">
                Payment successful! Redirecting...
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="flex justify-between items-center text-xs text-white/70 mb-3">
          <span>Amount:</span>
          <span className="font-medium text-white">
            {formatCurrency(amount, currency)}
          </span>
        </div>

        <Button
          type="submit"
          disabled={!stripe || processing || succeeded}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : succeeded ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Payment Successful
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay {formatCurrency(amount, currency)}
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-white/50 text-center">
        <p>This is a test payment. No actual charges will be made.</p>
        <p className="mt-1">
          Try using Stripe test card: <span className="text-white/80 font-mono">4242 4242 4242 4242</span>
        </p>
      </div>
    </form>
  );
}
