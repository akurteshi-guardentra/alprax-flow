// Preload functions for performance optimization
export const preloadAnalytics = () => import('@/pages/Analytics');
export const preloadPaymentWizard = () => import('@/components/payment-hub/PaymentWizard');

// Simple performance utilities
export function measureLoadTime(componentName: string) {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    console.log(`${componentName} loaded in ${duration.toFixed(2)}ms`);
  };
}