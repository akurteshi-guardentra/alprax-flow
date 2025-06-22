
import { Keypair, TransactionBuilder, Operation, Asset, Memo } from 'stellar-sdk';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';
import { StellarTransactionResult } from './types';
import { server, networkPassphrase } from './config';
import { getAccount } from './account';
import { recordEnhancedTransaction } from './enhanced-transaction';

export async function sendPayment(
  destinationId: string,
  amount: string,
  asset: string = 'XLM',
  recipientName?: string,
  recipientId?: string,
  memo?: string,
  extra?: {
    recipient_country?: string;
    transfer_purpose?: string;
    transfer_category?: string;
  }
): Promise<StellarTransactionResult> {
  try {
    console.log(`Initiating payment to ${destinationId} with amount ${amount} XLM`);
    
    // Validate inputs
    if (!destinationId || destinationId.trim() === '') {
      throw new Error('Destination address is required');
    }
    
    if (!destinationId.startsWith('G') || destinationId.length !== 56) {
      throw new Error('Invalid Stellar address format');
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      throw new Error('Invalid amount');
    }
    
    const account = await getAccount();
    if (!account) {
      throw new Error('No Stellar account found. Please create an account first.');
    }

    // Decrypt secret key
    const secretKey = atob(account.encryptedSecret);
    const sourceKeypair = Keypair.fromSecret(secretKey);

    // Load source account from network
    console.log('Loading source account from Stellar network...');
    const sourceAccount = await server.loadAccount(account.publicKey);

    // Check if destination account exists
    try {
      await server.loadAccount(destinationId);
      console.log('Destination account verified');
    } catch (error) {
      throw new Error('Destination account not found on the network');
    }

    // Get current network fee
    const fee = await server.fetchBaseFee();
    console.log(`Using network fee: ${fee} stroops`);

    // Build the transaction
    let transactionBuilder = new TransactionBuilder(sourceAccount, {
      fee: fee.toString(),
      networkPassphrase,
    })
    .addOperation(
      Operation.payment({
        destination: destinationId,
        asset: Asset.native(),
        amount: amount,
      })
    );
      
    // Add memo if provided
    if (memo && memo.trim() !== '') {
      transactionBuilder = transactionBuilder.addMemo(Memo.text(memo));
    }
    
    // Build and sign transaction
    const transaction = transactionBuilder.setTimeout(30).build();
    transaction.sign(sourceKeypair);
    
    console.log('Submitting transaction to Stellar network...');
    const result = await server.submitTransaction(transaction);
    console.log('Transaction successful:', result.hash);
    
    // Get the current user for recording the transaction
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated, skipping transaction recording');
    } else {
      // Record the transaction
      const timestamp = new Date().toISOString();
      
      try {
        await recordEnhancedTransaction({
          user_id: user.id,
          stellar_tx_hash: result.hash,
          transaction_type: 'payment',
          from_asset: 'XLM',
          to_asset: 'XLM',
          amount: parseFloat(amount),
          fee: parseFloat(fee.toString()) / 10000000, // Convert stroops to XLM
          status: 'completed',
          created_at: timestamp,
          completed_at: timestamp,
          memo: memo || '',
          recipient_country: extra?.recipient_country,
          transfer_purpose: extra?.transfer_purpose,
          transfer_category: extra?.transfer_category,
          recipient_name: recipientName || ''
        }, { recordReceipt: true });
        
        console.log('Transaction recorded successfully');
      } catch (recordError) {
        console.error('Error recording transaction:', recordError);
        // Don't throw here as the main transaction was successful
      }
    }

    hapticFeedback('success');
    
    return {
      success: true,
      hash: result.hash
    };
  } catch (error: any) {
    console.error('Error sending payment:', error);
    
    let errorMessage = 'Your payment could not be completed. Please try again or contact support.';
    
    // Handle common Stellar errors with better user messages
    if (error.response) {
      try {
        const resultCodes = error.response.data.extras.result_codes;
        if (resultCodes) {
          if (resultCodes.operations && resultCodes.operations.length > 0) {
            if (resultCodes.operations.includes('op_underfunded')) {
              errorMessage = 'Insufficient funds available for this payment';
            } else if (resultCodes.operations.includes('op_no_destination')) {
              errorMessage = 'The recipient account could not be found. Please check the address and try again.';
            }
          } else if (resultCodes.transaction) {
            if (resultCodes.transaction === 'tx_bad_seq') {
              errorMessage = 'Payment failed due to a sequence error. Please try again.';
            } else if (resultCodes.transaction === 'tx_insufficient_fee') {
              errorMessage = 'Transaction fee too low. Please try again.';
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing Stellar error response:', parseError);
      }
    } else if (error.message) {
      // Handle client-side validation errors
      if (error.message.includes('Invalid') || error.message.includes('required')) {
        errorMessage = error.message;
      } else if (error.message.includes('not found')) {
        errorMessage = 'The recipient account could not be found. Please check the address and try again.';
      }
    }
    
    hapticFeedback('error');
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function fundTestAccount(publicKey: string): Promise<StellarTransactionResult> {
  try {
    console.log('Requesting test funds for account:', publicKey);
    toast.loading('Adding test funds to your account...');
    
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${publicKey}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Funding failed: ${errorText}`);
    }
      
    const responseData = await response.json();
    console.log('Funding response:', responseData);
    
    // Record the funding transaction
    if (responseData.hash) {
      const timestamp = new Date().toISOString();
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        try {
          await recordEnhancedTransaction({
            user_id: user.id,
            stellar_tx_hash: responseData.hash,
            transaction_type: 'funding',
            from_asset: 'XLM',
            to_asset: 'XLM',
            amount: 10000, // Friendbot usually gives 10,000 XLM on testnet
            fee: 0,
            status: 'completed',
            completed_at: timestamp,
            created_at: timestamp,
            memo: 'Test account funding',
            recipient_name: 'Test Account'
          });
        } catch (recordError) {
          console.error('Error recording funding transaction:', recordError);
        }
      }
      
      // Fetch the current balance from the network to ensure accuracy
      try {
        const accountData = await server.loadAccount(publicKey);
        const xlmBalance = accountData.balances.find(b => b.asset_type === 'native');
        console.log('Updated balance after funding:', xlmBalance?.balance);
      } catch (balanceError) {
        console.error('Error fetching updated balance:', balanceError);
      }
    }
      
    toast.dismiss();
    toast.success('Test funds added successfully!');
    hapticFeedback('success');
    
    return { 
      success: true,
      hash: responseData.hash 
    };
  } catch (error) {
    console.error('Error funding testnet account:', error);
    toast.dismiss();
    toast.error('Failed to add test funds. Please try again later.');
    hapticFeedback('error');
    
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error funding account'
    };
  }
}
