import { Asset, Horizon, Keypair, Networks, Operation, TransactionBuilder, Memo } from 'stellar-sdk';
import { captureError } from '@/utils/error-tracking';
import { ENV } from '@/config/environment';

export interface TransactionOptions {
  source: string;
  destination: string;
  amount: string;
  memo?: string;
  asset?: Asset;
  timeout?: number;
  maxRetries?: number;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
  retryCount: number;
  executionTime: number;
}

export class EnhancedStellarTransaction {
  private server: Horizon.Server;
  private networkPassphrase: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second base delay

  constructor() {
    this.server = new Horizon.Server(
      ENV.isDevelopment 
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );
    this.networkPassphrase = ENV.isDevelopment 
      ? Networks.TESTNET 
      : Networks.PUBLIC;
  }

  async executeTransaction(
    sourceKeypair: Keypair,
    options: TransactionOptions
  ): Promise<TransactionResult> {
    const startTime = Date.now();
    let retryCount = 0;
    const maxRetries = options.maxRetries ?? this.maxRetries;

    while (retryCount <= maxRetries) {
      try {
        // Load source account
        const sourceAccount = await this.server.loadAccount(options.source);
        
        // Build transaction
        const baseFee = await this.server.fetchBaseFee();
        const transaction = new TransactionBuilder(sourceAccount, {
          fee: baseFee.toString(),
          networkPassphrase: this.networkPassphrase,
          timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 300 } // 5 min timeout
        })
        .addOperation(Operation.payment({
          destination: options.destination,
          asset: options.asset || Asset.native(),
          amount: options.amount
        }));

        // Add memo if provided
        if (options.memo) {
          transaction.addMemo(Memo.text(options.memo));
        }

        // Build and sign
        const builtTransaction = transaction.build();
        builtTransaction.sign(sourceKeypair);

        // Submit with retry logic
        const result = await this.submitWithRetry(builtTransaction, retryCount);
        
        return {
          success: true,
          hash: result.hash,
          retryCount,
          executionTime: Date.now() - startTime
        };

      } catch (error) {
        retryCount++;
        
        // Log error for monitoring
        captureError(error as Error, {
          component: 'EnhancedStellarTransaction',
          action: 'executeTransaction',
          metadata: {
            retryCount,
            maxRetries,
            sourceAccount: options.source,
            destination: options.destination,
            amount: options.amount
          }
        }, 'high');

        // Check if error is retryable
        if (!this.isRetryableError(error as Error) || retryCount > maxRetries) {
          return {
            success: false,
            error: this.parseErrorMessage(error as Error),
            retryCount,
            executionTime: Date.now() - startTime
          };
        }

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, retryCount - 1);
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: 'Maximum retry attempts exceeded',
      retryCount,
      executionTime: Date.now() - startTime
    };
  }

  private async submitWithRetry(transaction: any, retryCount: number): Promise<any> {
    try {
      return await this.server.submitTransaction(transaction);
    } catch (error: any) {
      // Handle specific Stellar errors
      if (error.response?.data?.extras?.result_codes) {
        const resultCodes = error.response.data.extras.result_codes;
        
        // Handle sequence number errors (common in concurrent transactions)
        if (resultCodes.transaction === 'tx_bad_seq') {
          throw new Error('SEQUENCE_ERROR');
        }
        
        // Handle insufficient balance
        if (resultCodes.operations?.includes('op_underfunded')) {
          throw new Error('INSUFFICIENT_BALANCE');
        }
        
        // Handle destination account not found
        if (resultCodes.operations?.includes('op_no_destination')) {
          throw new Error('DESTINATION_NOT_FOUND');
        }
      }
      
      throw error;
    }
  }

  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'SEQUENCE_ERROR',
      'timeout',
      'network',
      'CONNECTION_ERROR',
      'ECONNRESET',
      'ETIMEDOUT'
    ];

    return retryableErrors.some(retryableError => 
      error.message?.includes(retryableError) || 
      error.name?.includes(retryableError)
    );
  }

  private parseErrorMessage(error: Error): string {
    if (error.message === 'INSUFFICIENT_BALANCE') {
      return 'Insufficient balance to complete the transaction';
    }
    
    if (error.message === 'DESTINATION_NOT_FOUND') {
      return 'Destination account does not exist';
    }
    
    if (error.message === 'SEQUENCE_ERROR') {
      return 'Transaction sequence error, please retry';
    }
    
    return error.message || 'An unknown error occurred';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to validate transaction before submission
  async validateTransaction(options: TransactionOptions): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Check if source account exists and has sufficient balance
      const sourceAccount = await this.server.loadAccount(options.source);
      const balance = sourceAccount.balances.find(b => {
        if (b.asset_type === 'native') return true;
        if (options.asset && 'asset_code' in b) {
          return b.asset_code === options.asset.code;
        }
        return false;
      });

      if (!balance || parseFloat(balance.balance) < parseFloat(options.amount)) {
        errors.push('Insufficient balance');
      }

      // Check if destination account exists
      try {
        await this.server.loadAccount(options.destination);
      } catch {
        errors.push('Destination account does not exist');
      }

      // Validate amount
      if (parseFloat(options.amount) <= 0) {
        errors.push('Amount must be greater than zero');
      }

    } catch (error) {
      errors.push('Failed to validate transaction parameters');
      captureError(error as Error, {
        component: 'EnhancedStellarTransaction',
        action: 'validateTransaction'
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}