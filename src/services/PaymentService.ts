
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

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  estimatedTime?: number;
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
    if (!request.recipientId || request.recipientId.trim() === '') {
      throw new Error('Recipient address is required');
    }
    
    if (!request.amount || parseFloat(request.amount) <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    if (!request.description || request.description.trim() === '') {
      throw new Error('Payment description is required');
    }
    
    // Validate Stellar address format
    if (!request.recipientId.startsWith('G') || request.recipientId.length !== 56) {
      throw new Error('Invalid recipient address format');
    }
  }

  /**
   * Convert technical errors to user-friendly messages
   */
  private getUserFriendlyError(error: any): string {
    const errorMessage = error?.message || error || 'Unknown error';
    
    if (errorMessage.includes('insufficient')) {
      return "You don't have enough funds for this payment. Please add funds and try again.";
    }
    
    if (errorMessage.includes('no_destination') || errorMessage.includes('not found')) {
      return "The recipient address couldn't be found. Please check the address and try again.";
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      return "Network error occurred. Please check your connection and try again.";
    }
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
      return "Too many requests. Please wait a moment and try again.";
    }
    
    if (errorMessage.includes('invalid') && errorMessage.includes('address')) {
      return "The recipient address format is invalid. Please check and try again.";
    }
    
    // Default fallback
    return "Payment failed. Please try again or contact support if the problem persists.";
  }

  /**
   * Get pending transactions
   */
  public getPendingTransactions(): PaymentRequest[] {
    return Array.from(this.pendingTransactions.values());
  }

  /**
   * Cancel pending transaction
   */
  public cancelTransaction(transactionId: string): boolean {
    return this.pendingTransactions.delete(transactionId);
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();
