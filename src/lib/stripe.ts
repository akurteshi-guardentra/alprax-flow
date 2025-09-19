import { loadStripe } from '@stripe/stripe-js';

// Using the real Stripe test publishable key from Supabase secrets
// This is connected to your Stripe test account for demo purposes
const STRIPE_PUBLISHABLE_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Note: This is your real Stripe test key for demo payments
// All transactions are in test mode and won't charge real money
