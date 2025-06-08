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
  amount: string,  // Amount must be string for Stellar SDK
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
    console.log(`Sending payment to ${destinationId} with amount ${amount} XLM`);
    if (recipientId) {
      console.log(`Recipient ID: ${recipientId}, Name: ${recipientName || 'unknown'}`);
    }
    
    const account = await getAccount();
    if (!account) throw new Error('No Stellar account found');

    // Decrypt secret key (implement proper decryption in production)
    const secretKey = atob(account.encryptedSecret);
    const sourceKeypair = Keypair.fromSecret(secretKey);

    // Get account details from network
    const sourceAccount = await server.loadAccount(account.publicKey);

    // Get the transaction fee before building the transaction
    const fee = (await server.fetchBaseFee()).toString();

    // Build the transaction
    let transactionBuilder = new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: destinationId,
          asset: Asset.native(), // Using XLM for now
          amount: amount, // amount is already a string
        })
      );
      
    // Add memo if provided
    if (memo) {
      // Use the correct Memo.text() from stellar-sdk
      transactionBuilder = transactionBuilder.addMemo(Memo.text(memo));
    }
    
    // Build the transaction
    const transaction = transactionBuilder.setTimeout(30).build();    // Sign and submit transaction
    transaction.sign(sourceKeypair);
    console.log('Submitting transaction to Stellar network...');
    const result = await server.submitTransaction(transaction);
    console.log('Transaction successful:', result);
    
    // Get the current user for recording the transaction
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
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
        fee: parseFloat(fee),
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

    toast.success('Payment sent successfully');
    hapticFeedback('success');
    
    return {
      success: true,
      hash: result.hash
    };
  } catch (error: any) {
    console.error('Error sending payment:', error);
    
    let errorMessage = 'Your payment could not be completed. Please try again or contact support.';
    
    // Handle common Stellar errors
    if (error.response) {
      try {
        const resultCodes = error.response.data.extras.result_codes;
        if (resultCodes) {
          if (resultCodes.operations && resultCodes.operations.length > 0) {            if (resultCodes.operations.includes('op_underfunded')) {
              errorMessage = 'Insufficient funds available for this payment';} else if (resultCodes.operations.includes('op_no_destination')) {
              errorMessage = 'The recipient could not be found. Please check the payment details and try again.';
            }
          } else if (resultCodes.transaction) {          if (resultCodes.transaction === 'tx_bad_seq') {
              errorMessage = 'Payment failed due to a temporary issue. Please try again';
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing Stellar error response:', parseError);
      }
    }
    
    toast.error(errorMessage);
    hapticFeedback('error');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending payment'
    };
  }
}

export async function fundTestAccount(publicKey: string): Promise<StellarTransactionResult> {
  try {
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
          // Add transaction record
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
        
        // Could update a local cache here if needed
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
