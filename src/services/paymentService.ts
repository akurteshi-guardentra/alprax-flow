import { toast } from 'sonner';

// Types for payment service
export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  payment_method_type: string;
  description?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Create a payment intent with Stripe
 * In a real app, this would call your backend API which would then create a payment intent with Stripe
 * For this demo, we're simulating the response
 */
export async function createPaymentIntent(
  request: PaymentIntentRequest
): Promise<PaymentIntentResponse> {
  console.log('Creating payment intent:', request);
  
  // In a real app, this would be an API call to your backend
  // return fetch('/api/create-payment-intent', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // }).then(res => res.json());
  
  // For demo purposes, simulate a successful response
  // This simulates the delay of an API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a random ID for the payment intent
  const id = 'pi_' + Math.random().toString(36).substring(2, 15);
  
  // Log the simulated payment intent
  console.log('Simulated payment intent created:', id);
  
  // Return a simulated payment intent response
  return {
    clientSecret: `${id}_secret_${Math.random().toString(36).substring(2, 15)}`,
    id,
    amount: request.amount,
    currency: request.currency,
    status: 'requires_payment_method'
  };
}

/**
 * Process a payment with Stripe
 * In a real app, this would use the Stripe SDK to confirm the payment
 * For this demo, we're simulating the response
 */
export async function processPayment(
  clientSecret: string,
  paymentMethod: any
): Promise<{ success: boolean; error?: string }> {
  console.log('Processing payment:', { clientSecret, paymentMethod });
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate a successful payment 80% of the time
  const isSuccessful = Math.random() > 0.2;
  
  if (isSuccessful) {
    console.log('Payment processed successfully');
    toast.success('Payment processed successfully');
    return { success: true };
  } else {
    console.error('Payment failed');
    toast.error('Payment failed. Please try again.');
    return { 
      success: false, 
      error: 'Payment failed. This is a simulated error for demonstration purposes.' 
    };
  }
}

/**
 * Get test card numbers for Stripe
 * These are standard test card numbers provided by Stripe
 */
export function getTestCards() {
  return [
    {
      name: 'Visa - Success',
      number: '4242 4242 4242 4242',
      expiry: '12/25',
      cvc: '123'
    },
    {
      name: 'Visa - Decline',
      number: '4000 0000 0000 0002',
      expiry: '12/25',
      cvc: '123'
    },
    {
      name: 'Visa - Insufficient Funds',
      number: '4000 0000 0000 9995',
      expiry: '12/25',
      cvc: '123'
    },
    {
      name: 'Mastercard - Success',
      number: '5555 5555 5555 4444',
      expiry: '12/25',
      cvc: '123'
    }
  ];
}
