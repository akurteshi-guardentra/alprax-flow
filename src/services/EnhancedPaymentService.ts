import { sendPayment, PaymentResult } from '@/lib/stellar/payment';
import { getAccount } from '@/lib/stellar/account';
import { server } from '@/lib/stellar/config';
import { PaymentErrorService } from './PaymentErrorService';
import { TransactionQueueService } from './TransactionQueueService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';

export interface EnhancedPaymentParams {
  destinationAddress: string;
  amount: string;
  assetCode?: string;
  recipientName?: string;
  recipientId?: string;
  memo?: string;
  metadata?: {
    recipient_country?: string;
    transfer_purpose?: string;
    transfer_category?: string;
  };
  useQueue?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class EnhancedPaymentService {
  // Pre-flight validation
  static async validatePayment(params: EnhancedPaymentParams): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate stellar address format
      if (!params.destinationAddress || 
          !params.destinationAddress.startsWith('G') || 
          params.destinationAddress.length !== 56) {
        errors.push('Invalid recipient Stellar address format');
      }

      // Validate amount
      const amount = parseFloat(params.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push('Amount must be greater than 0');
      }

      // Check if user has account
      const account = await getAccount();
      if (!account) {
        errors.push('No Stellar account found. Please create an account first.');
      }

      if (account) {
        // Check account balance
        try {
          const sourceAccount = await server.loadAccount(account.publicKey);
          const balance = sourceAccount.balances.find(b => b.asset_type === 'native');
          const availableBalance = balance ? parseFloat(balance.balance) : 0;
          
          if (amount > availableBalance) {
            errors.push(`Insufficient balance. Available: ${availableBalance.toFixed(4)} XLM`);
          } else if (amount > availableBalance * 0.9) {
            warnings.push('This transaction will use most of your available balance');
          }
        } catch (error) {
          console.error('Error checking balance:', error);
          warnings.push('Could not verify account balance');
        }

        // Verify destination account exists
        try {
          await server.loadAccount(params.destinationAddress);
        } catch (error) {
          errors.push('Recipient account does not exist on the Stellar network');
        }
      }

      // Validate memo length
      if (params.memo && params.memo.length > 28) {
        errors.push('Memo cannot exceed 28 characters');
      }

    } catch (error) {
      console.error('Validation error:', error);
      errors.push('Failed to validate transaction');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Enhanced payment execution with queue support
  static async executePayment(params: EnhancedPaymentParams): Promise<PaymentResult> {
    const validationResult = await this.validatePayment(params);
    
    if (!validationResult.isValid) {
      const errorMessage = validationResult.errors.join(', ');
      await PaymentErrorService.logError({
        errorType: 'validation',
        errorMessage,
        errorDetails: { validationErrors: validationResult.errors }
      });
      
      PaymentErrorService.showUserFriendlyError('validation', errorMessage);
      return { success: false, error: errorMessage };
    }

    // Show warnings if any
    if (validationResult.warnings.length > 0) {
      validationResult.warnings.forEach(warning => {
        toast.warning(warning);
      });
    }

    // Queue transaction if requested
    if (params.useQueue) {
      const queuedTransaction = await TransactionQueueService.queueTransaction({
        recipientAddress: params.destinationAddress,
        amount: parseFloat(params.amount),
        memo: params.memo,
        metadata: params.metadata || {}
      });

      if (queuedTransaction) {
        toast.success('Transaction queued for processing');
        return { success: true, txHash: `queued-${queuedTransaction.id}` };
      } else {
        return { success: false, error: 'Failed to queue transaction' };
      }
    }

    // Execute payment immediately
    try {
      toast.loading('Processing your payment...', { id: 'payment-processing' });
      hapticFeedback('medium');

      const result = await sendPayment(
        params.destinationAddress,
        params.amount,
        params.assetCode || 'XLM',
        params.recipientName,
        params.recipientId,
        params.memo,
        params.metadata
      );

      toast.dismiss('payment-processing');

      if (result.success) {
        toast.success('Payment sent successfully!');
        hapticFeedback('success');
        
        // Update transaction queue if there was a queued transaction
        await this.updateQueuedTransactionStatus(result.txHash, 'completed');
      } else {
        // Log the error with enhanced details
        await PaymentErrorService.logError({
          errorType: this.categorizeError(result.error || ''),
          errorMessage: result.error || 'Payment failed',
          errorDetails: { 
            stellarError: result.error,
            amount: params.amount,
            recipient: params.destinationAddress
          },
          stellarTxHash: result.txHash
        });

        PaymentErrorService.showUserFriendlyError(
          this.categorizeError(result.error || ''),
          result.error || 'Payment failed'
        );
        hapticFeedback('error');
      }

      return result;
    } catch (error: any) {
      toast.dismiss('payment-processing');
      console.error('Payment execution error:', error);
      
      const errorMessage = error.message || 'Unexpected payment error';
      await PaymentErrorService.logError({
        errorType: 'unknown',
        errorMessage,
        errorDetails: { 
          error: errorMessage,
          stack: error.stack,
          amount: params.amount,
          recipient: params.destinationAddress
        }
      });

      PaymentErrorService.showUserFriendlyError('unknown', errorMessage);
      hapticFeedback('error');
      
      return { success: false, error: errorMessage };
    }
  }

  // Process queued transactions
  static async processQueuedTransactions(): Promise<void> {
    const pendingTransactions = await TransactionQueueService.getPendingTransactions();
    
    for (const transaction of pendingTransactions) {
      if (transaction.attempts >= transaction.max_attempts) {
        await TransactionQueueService.updateTransactionStatus(transaction.id, 'failed', {
          error_message: 'Maximum retry attempts exceeded'
        });
        continue;
      }

      try {
        await TransactionQueueService.updateTransactionStatus(transaction.id, 'processing');
        await TransactionQueueService.incrementAttempts(transaction.id);

        const result = await sendPayment(
          transaction.recipient_address,
          transaction.amount.toString(),
          'XLM',
          transaction.metadata?.recipientName,
          transaction.metadata?.recipientId,
          transaction.memo,
          transaction.metadata
        );

        if (result.success) {
          await TransactionQueueService.updateTransactionStatus(transaction.id, 'completed', {
            stellar_tx_hash: result.txHash,
            completed_at: new Date().toISOString()
          });
          toast.success(`Queued payment to ${transaction.recipient_address} completed`);
        } else {
          await TransactionQueueService.updateTransactionStatus(transaction.id, 'failed', {
            error_message: result.error || 'Payment failed'
          });
          
          await PaymentErrorService.logError({
            transactionId: transaction.id,
            errorType: this.categorizeError(result.error || ''),
            errorMessage: result.error || 'Queued payment failed',
            errorDetails: { queuedTransaction: transaction }
          });
        }
      } catch (error: any) {
        await TransactionQueueService.updateTransactionStatus(transaction.id, 'failed', {
          error_message: error.message || 'Unknown error'
        });
        
        await PaymentErrorService.logError({
          transactionId: transaction.id,
          errorType: 'unknown',
          errorMessage: error.message || 'Queued payment error',
          errorDetails: { queuedTransaction: transaction, error: error.message }
        });
      }
    }
  }

  // Helper methods
  private static categorizeError(errorMessage: string): 'validation' | 'network' | 'stellar' | 'balance' | 'unknown' {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('insufficient') || message.includes('underfunded')) {
      return 'balance';
    }
    if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('stellar') || message.includes('tx_') || message.includes('op_')) {
      return 'stellar';
    }
    if (message.includes('invalid') || message.includes('format') || message.includes('address')) {
      return 'validation';
    }
    
    return 'unknown';
  }

  private static async updateQueuedTransactionStatus(txHash?: string, status: 'completed' | 'failed' = 'completed'): Promise<void> {
    if (!txHash || txHash.startsWith('queued-')) return;
    
    try {
      await supabase
        .from('transaction_queue')
        .update({ 
          status, 
          stellar_tx_hash: txHash,
          completed_at: new Date().toISOString()
        })
        .eq('stellar_tx_hash', txHash);
    } catch (error) {
      console.error('Failed to update queued transaction status:', error);
    }
  }

  // Retry failed transaction
  static async retryFailedTransaction(transactionId: string): Promise<PaymentResult> {
    try {
      const canRetry = await TransactionQueueService.retryTransaction(transactionId);
      if (!canRetry) {
        return { success: false, error: 'Cannot retry this transaction' };
      }

      // Process the retried transaction
      await this.processQueuedTransactions();
      return { success: true, txHash: `retry-${transactionId}` };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to retry transaction' };
    }
  }
}