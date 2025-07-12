import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { errorTracker } from '@/utils/error-tracking';
import { ENV } from '@/config/environment';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.setState({ errorId });

    // Track error in production
    if (ENV.FEATURES.ENABLE_ERROR_REPORTING) {
      errorTracker.captureException(error, {
        errorId,
        componentStack: errorInfo.componentStack,
        errorBoundary: 'ProductionErrorBoundary',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }

    // Log error in development
    if (ENV.isDevelopment) {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', errorId);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorId } = this.state;
    const subject = `Bug Report - Error ID: ${errorId}`;
    const body = `
Error ID: ${errorId}
Error Message: ${error?.message || 'Unknown error'}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
`;
    
    const mailtoLink = `mailto:support@alprax.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId } = this.state;
      const { showDetails = ENV.isDevelopment } = this.props;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-900 dark:text-red-100">
                Something went wrong
              </CardTitle>
              <p className="text-red-700 dark:text-red-300 mt-2">
                We're sorry, but an unexpected error occurred. Our team has been notified.
              </p>
              {errorId && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Error ID: <code className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">{errorId}</code>
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
                <Button 
                  variant="outline"
                  onClick={this.handleReportBug}
                  className="flex items-center gap-2"
                >
                  <Bug className="w-4 h-4" />
                  Report Bug
                </Button>
              </div>

              {showDetails && error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100">
                    Technical Details (Click to expand)
                  </summary>
                  <div className="mt-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-100">Error Message:</h4>
                        <pre className="text-sm text-red-800 dark:text-red-200 bg-white dark:bg-red-950/20 p-2 rounded border overflow-auto">
                          {error.message}
                        </pre>
                      </div>
                      
                      {error.stack && (
                        <div>
                          <h4 className="font-medium text-red-900 dark:text-red-100">Stack Trace:</h4>
                          <pre className="text-xs text-red-700 dark:text-red-300 bg-white dark:bg-red-950/20 p-2 rounded border overflow-auto max-h-40">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      
                      {errorInfo?.componentStack && (
                        <div>
                          <h4 className="font-medium text-red-900 dark:text-red-100">Component Stack:</h4>
                          <pre className="text-xs text-red-700 dark:text-red-300 bg-white dark:bg-red-950/20 p-2 rounded border overflow-auto max-h-40">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}