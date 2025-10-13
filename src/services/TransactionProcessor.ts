import { TransactionQueueService, QueuedTransaction } from './TransactionQueueService';
import { sendPayment } from '@/lib/stellar/payment';
import { PaymentErrorService } from './PaymentErrorService';

/**
 * Process queued transactions with automatic retry logic
 * This service runs in the background to process pending transactions
 */
export class TransactionProcessor {
  private static isProcessing = false;
  private static processingInterval: NodeJS.Timeout | null = null;

  /**
   * Start automatic processing of queued transactions
   * @param intervalMs - Interval in milliseconds to check for pending transactions (default: 30s)
   */
  static startAutoProcessing(intervalMs: number = 30000): void {
    if (this.processingInterval) {
      console.log('Transaction processor already running');
      return;
    }

    console.log('Starting automatic transaction processor...');
    
    // Process immediately on start
    this.processQueue();

    // Then process at regular intervals
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, intervalMs);
  }

  /**
   * Stop automatic processing
   */
  static stopAutoProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Transaction processor stopped');
    }
  }

  /**
   * Process all pending transactions in the queue
   */
  static async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('Already processing transactions, skipping...');
      return;
    }

    try {
      this.isProcessing = true;
      const pendingTransactions = await TransactionQueueService.getPendingTransactions();

      if (pendingTransactions.length === 0) {
        return;
      }

      console.log(`Processing ${pendingTransactions.length} pending transactions...`);

      for (const transaction of pendingTransactions) {
        await this.processTransaction(transaction);
        // Add small delay between transactions to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error processing transaction queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single queued transaction
   */
  private static async processTransaction(transaction: QueuedTransaction): Promise<void> {
    try {
      console.log(`Processing transaction ${transaction.id}...`);

      // Mark as processing
      await TransactionQueueService.updateTransactionStatus(transaction.id, 'processing');

      // Attempt the payment
      const result = await sendPayment(
        transaction.recipient_address,
        transaction.amount.toString(),
        'XLM',
        transaction.metadata?.recipient_name,
        transaction.metadata?.recipient_id,
        transaction.memo,
        transaction.metadata
      );

      if (result.success) {
        // Mark as completed
        await TransactionQueueService.updateTransactionStatus(transaction.id, 'completed', {
          stellar_tx_hash: result.txHash,
          completed_at: new Date().toISOString()
        });
        console.log(`Transaction ${transaction.id} completed successfully`);
      } else {
        // Increment attempts and handle retry logic
        await TransactionQueueService.incrementAttempts(transaction.id);
        
        const shouldRetry = transaction.attempts < transaction.max_attempts - 1;
        
        if (shouldRetry) {
          await TransactionQueueService.updateTransactionStatus(transaction.id, 'pending', {
            error_message: result.error
          });
          console.log(`Transaction ${transaction.id} failed, will retry (attempt ${transaction.attempts + 1}/${transaction.max_attempts})`);
        } else {
          await TransactionQueueService.updateTransactionStatus(transaction.id, 'failed', {
            error_message: result.error
          });
          console.log(`Transaction ${transaction.id} failed permanently after ${transaction.max_attempts} attempts`);
          
          // Log final failure
          await PaymentErrorService.logError({
            transactionId: transaction.id,
            errorType: result.errorType as any || 'unknown',
            errorMessage: `Transaction failed after ${transaction.max_attempts} attempts: ${result.error}`,
            errorDetails: {
              transaction,
              finalError: result.error
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error processing transaction ${transaction.id}:`, error);
      
      await TransactionQueueService.incrementAttempts(transaction.id);
      await TransactionQueueService.updateTransactionStatus(transaction.id, 'pending', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Manually retry a specific transaction
   */
  static async retryTransaction(transactionId: string): Promise<boolean> {
    try {
      const success = await TransactionQueueService.retryTransaction(transactionId);
      
      if (success) {
        // Process immediately
        const transactions = await TransactionQueueService.getPendingTransactions();
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (transaction) {
          await this.processTransaction(transaction);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error retrying transaction:', error);
      return false;
    }
  }
}
