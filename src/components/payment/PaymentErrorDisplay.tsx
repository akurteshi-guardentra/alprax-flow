import React from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentError {
  type: 'insufficient_balance' | 'account_not_found' | 'network_error' | 'validation_error' | 'unknown';
  message: string;
  originalError?: string;
  canRetry?: boolean;
  suggestedAction?: string;
  txHash?: string;
}

interface PaymentErrorDisplayProps {
  error: PaymentError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const PaymentErrorDisplay: React.FC<PaymentErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = ''
}) => {
  const getErrorDetails = (error: PaymentError) => {
    switch (error.type) {
      case 'insufficient_balance':
        return {
          title: 'Insufficient Balance',
          description: 'You don\'t have enough XLM to complete this payment. Please add funds to your account.',
          icon: <AlertTriangle className="h-4 w-4" />,
          variant: 'destructive' as const,
          actionText: 'Add Funds'
        };
      
      case 'account_not_found':
        return {
          title: 'Recipient Account Not Found',
          description: 'The recipient\'s account doesn\'t exist on the Stellar network. We can automatically activate it for them.',
          icon: <AlertTriangle className="h-4 w-4" />,
          variant: 'default' as const,
          actionText: 'Activate Account'
        };
      
      case 'network_error':
        return {
          title: 'Network Connection Error',
          description: 'Unable to connect to the Stellar network. Please check your internet connection and try again.',
          icon: <RefreshCw className="h-4 w-4" />,
          variant: 'destructive' as const,
          actionText: 'Retry Payment'
        };
      
      case 'validation_error':
        return {
          title: 'Payment Validation Failed',
          description: error.message || 'The payment details are invalid. Please check the recipient address and amount.',
          icon: <AlertTriangle className="h-4 w-4" />,
          variant: 'destructive' as const,
          actionText: 'Fix Details'
        };
      
      default:
        return {
          title: 'Payment Failed',
          description: error.message || 'An unexpected error occurred while processing your payment.',
          icon: <AlertTriangle className="h-4 w-4" />,
          variant: 'destructive' as const,
          actionText: 'Try Again'
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  return (
    <Alert variant={errorDetails.variant} className={className}>
      <div className="flex items-start gap-3">
        {errorDetails.icon}
        <div className="flex-1 space-y-2">
          <div className="font-medium">{errorDetails.title}</div>
          <AlertDescription className="text-sm">
            {errorDetails.description}
          </AlertDescription>
          
          {error.suggestedAction && (
            <div className="text-sm text-muted-foreground">
              <strong>Suggestion:</strong> {error.suggestedAction}
            </div>
          )}
          
          {error.originalError && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">Technical details</summary>
              <code className="mt-1 block">{error.originalError}</code>
            </details>
          )}
          
          <div className="flex gap-2 pt-2">
            {error.canRetry && onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                {errorDetails.actionText}
              </Button>
            )}
            
            {error.txHash && (
              <Button size="sm" variant="outline" asChild>
                <a 
                  href={`https://stellar.expert/explorer/testnet/tx/${error.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Transaction
                </a>
              </Button>
            )}
            
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
};

export const createPaymentError = (
  type: PaymentError['type'],
  message: string,
  originalError?: string,
  canRetry: boolean = true
): PaymentError => {
  let suggestedAction: string | undefined;

  switch (type) {
    case 'insufficient_balance':
      suggestedAction = 'Add funds to your account or reduce the payment amount';
      break;
    case 'account_not_found':
      suggestedAction = 'We can automatically activate the recipient\'s account';
      break;
    case 'network_error':
      suggestedAction = 'Check your internet connection and try again';
      break;
    case 'validation_error':
      suggestedAction = 'Verify the recipient address and payment amount';
      canRetry = false;
      break;
  }

  return {
    type,
    message,
    originalError,
    canRetry,
    suggestedAction
  };
};