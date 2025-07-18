import { lazy } from 'react';

// Lazy load heavy components for better performance
export const LazyPaymentWizard = lazy(() => 
  import('@/components/payment-hub/PaymentWizard').then(module => ({ 
    default: module.PaymentWizard 
  }))
);

export const LazyTransactionHistory = lazy(() => 
  import('@/components/TransactionHistory').then(module => ({ 
    default: module.TransactionHistory 
  }))
);

export const LazyAnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AnalyticsDashboard').then(module => ({ 
    default: module.AnalyticsDashboard 
  }))
);

export const LazyComprehensiveTest = lazy(() => 
  import('@/components/testing/ComprehensiveTest').then(module => ({ 
    default: module.ComprehensiveTest 
  }))
);

export const LazySystemHealthDashboard = lazy(() => 
  import('@/components/admin/SystemHealthDashboard').then(module => ({ 
    default: module.SystemHealthDashboard 
  }))
);

export const LazyStripeCardPayment = lazy(() => 
  import('@/components/payment/StripeCardPayment').then(module => ({ 
    default: module.StripeCardPaymentWrapper 
  }))
);