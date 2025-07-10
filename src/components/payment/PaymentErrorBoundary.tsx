
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PaymentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Payment error caught by boundary:', error, errorInfo);
    
    // Track error in production
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag;
      if (typeof gtag === 'function') {
        gtag('event', 'exception', {
          description: error.message,
          fatal: false,
          custom_map: {
            component_stack: errorInfo.componentStack
          }
        });
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div role="alert" aria-live="assertive">
          <ModernCard variant="glass" className="mx-4 my-8">
          <ModernCardContent className="text-center py-8">
            <AlertTriangle 
              className="w-12 h-12 text-red-400 mx-auto mb-4" 
              aria-hidden="true"
            />
            <h3 
              className="text-lg font-semibold text-white mb-2"
              id="payment-error-title"
            >
              Payment Error
            </h3>
            <p 
              className="text-white/70 mb-4"
              aria-describedby="payment-error-title"
            >
              Something went wrong with the payment process. Please try again.
            </p>
            <Button
              onClick={this.handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Retry payment process"
            >
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
          </ModernCardContent>
          </ModernCard>
        </div>
      );
    }

    return this.props.children;
  }
}
