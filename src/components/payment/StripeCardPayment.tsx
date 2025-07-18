import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { StripePaymentService } from '@/services/StripePaymentService';
import { toast } from 'sonner';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

interface StripeCardPaymentProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function StripeCardPayment(props: StripeCardPaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    // Create payment method
    const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (paymentMethodError) {
      setError(paymentMethodError.message || 'Payment method creation failed');
      setProcessing(false);
      return;
    }

    // Confirm payment
    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
      props.clientSecret,
      {
        payment_method: paymentMethod.id,
      }
    );

    if (confirmError) {
      setError(confirmError.message || 'Payment confirmation failed');
      setProcessing(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      setSucceeded(true);
      setProcessing(false);
      toast.success('Payment successful!');
      props.onSuccess();
    } else {
      setError('Payment was not successful');
      setProcessing(false);
      props.onError('Payment was not successful');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {formatCurrency(props.amount, props.currency)}
          </div>
          <div className="text-sm text-muted-foreground">
            Secure payment powered by Stripe
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {succeeded && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment completed successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Card details</label>
            <div className="p-3 border border-input rounded-md bg-background">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: 'hsl(var(--foreground))',
                      '::placeholder': {
                        color: 'hsl(var(--muted-foreground))',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!stripe || processing || succeeded}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : succeeded ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Payment Complete
              </>
            ) : (
              `Pay ${formatCurrency(props.amount, props.currency)}`
            )}
          </Button>
        </form>

        <div className="text-xs text-muted-foreground text-center">
          Your payment information is encrypted and secure
        </div>
      </CardContent>
    </Card>
  );
}

// Wrapper component with Elements provider
export function StripeCardPaymentWrapper(props: StripeCardPaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <StripeCardPayment {...props} />
    </Elements>
  );
}