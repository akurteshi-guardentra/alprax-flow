import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe test publishable key when you have it
// For now, using a placeholder test key
export const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

// This is a placeholder key for development purposes only
// You should replace it with your actual Stripe test key
// The key above is a well-known test key that doesn't work for actual charges
