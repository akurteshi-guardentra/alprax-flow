
import { sendPayment } from '@/lib/stellar/payment';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';

export interface PaymentRequest {
  recipientId: string;
  amount: string;
  description: string;
  recipientName?: string;
  metadata?: {
    recipient_country?: string;
    transfer_purpose?: string;
    transfer_category?: string;
  };
}

export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  payment_method_type: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  estimatedTime?: number;
}

export interface TestCard {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private pendingTransactions = new Map<string, PaymentRequest>();

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Process payment with enhanced error handling and real-time updates
   */
  public async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Store pending transaction
      this.pendingTransactions.set(transactionId, request);
      
      // Show processing notification
      toast.loading('Processing your payment...', { id: transactionId });
      hapticFeedback('medium');
      
      // Validate request
      this.validatePaymentRequest(request);
      
      // Process payment
      const result = await sendPayment(
        request.recipientId,
        request.amount,
        'XLM',
        request.recipientName,
        transactionId,
        request.description,
        request.metadata
      );
      
      if (result.success) {
        // Success handling
        toast.success(`Payment sent successfully to ${request.recipientName || 'recipient'}`, {
          id: transactionId
        });
        hapticFeedback('success');
        
        // Remove from pending
        this.pendingTransactions.delete(transactionId);
        
        return {
          success: true,
          transactionId: result.hash,
          estimatedTime: this.getEstimatedDeliveryTime()
        };
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      
      // Remove from pending
      this.pendingTransactions.delete(transactionId);
      
      // Enhanced error handling
      const errorMessage = this.getUserFriendlyError(error);
      toast.error(errorMessage, { id: transactionId });
      hapticFeedback('error');
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get estimated delivery time based on amount and destination
   */
  private getEstimatedDeliveryTime(): number {
    // In a real app, this would be based on network conditions and amount
    return Math.floor(Math.random() * 30) + 5; // 5-35 seconds
  }

  /**
   * Validate payment request
   */
  private validatePaymentRequest(request: PaymentRequest): void {
    if (!request.recipientId) {
      throw new Error('Recipient is required');
    }
    
    if (!request.amount || parseFloat(request.amount) <= 0) {
      throw new Error('Valid amount is required');
    }
    
    if (!request.description) {
      throw new Error('Payment description is required');
    }
  }

  /**
   * Convert blockchain/technical errors to user-friendly messages
   */
  private getUserFriendlyError(error: any): string {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('insufficient') || message.includes('balance')) {
        return 'You don\'t have enough funds for this payment';
      }
      
      if (message.includes('destination') || message.includes('recipient')) {
        return 'The recipient could not be found. Please check the details';
      }
      
      if (message.includes('network') || message.includes('timeout')) {
        return 'Network issue. Please try again in a moment';
      }
      
      if (message.includes('invalid') || message.includes('format')) {
        return 'Invalid payment details. Please check and try again';
      }
      
      // Return original message if it's already user-friendly
      if (!message.includes('stellar') && !message.includes('xlm') && !message.includes('blockchain')) {
        return error.message;
      }
    }
    
    return 'Payment could not be processed. Please try again or contact support';
  }

  /**
   * Get pending transactions count
   */
  public getPendingTransactionsCount(): number {
    return this.pendingTransactions.size;
  }

  /**
   * Cancel a pending transaction
   */
  public cancelTransaction(transactionId: string): boolean {
    return this.pendingTransactions.delete(transactionId);
  }
}

// Export singleton instance for easy access
export const paymentService = PaymentService.getInstance();

// Mock payment intent creation for funding
export async function createPaymentIntent(request: PaymentIntentRequest) {
  console.log('Creating payment intent:', request);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response
  return {
    clientSecret: `pi_mock_${Date.now()}_secret`,
    id: `pi_mock_${Date.now()}`,
    amount: request.amount,
    currency: request.currency
  };
}

// Mock payment processing
export async function processPayment(clientSecret: string, paymentMethod: any) {
  console.log('Processing payment:', { clientSecret, paymentMethod });
  
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    paymentIntent: {
      id: clientSecret.replace('_secret', ''),
      status: 'succeeded'
    }
  };
}
