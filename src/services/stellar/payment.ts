
import { Keypair, TransactionBuilder, Operation, Asset, Memo } from 'stellar-sdk';
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";
import { server, network, config } from './config';
import { PaymentParams, TransactionResult } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Send a payment transaction
 * @param {PaymentParams} params - Payment parameters
 * @returns {Promise<TransactionResult>} - Transaction result
 */
export async function sendPayment({ 
  sourceSecretKey, 
  destinationPublicKey, 
  amount, 
  asset = Asset.native(),
  memo = ''
}: PaymentParams): Promise<TransactionResult> {
  try {
    // Get the user for database records
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Load the source account
    const sourceKeypair = Keypair.fromSecret(sourceSecretKey);
    const sourcePublicKey = sourceKeypair.publicKey();
    
    // Check if destination account exists, if not try to fund it
    try {
      await server.loadAccount(destinationPublicKey);
    } catch (error) {
      console.log('Destination account does not exist, attempting to fund...');
      try {
        const response = await fetch(
          `https://friendbot.stellar.org?addr=${destinationPublicKey}`
        );
        if (!response.ok) {
          throw new Error(`Funding failed with status ${response.status}`);
        }
        console.log('Successfully funded destination account');
        // Wait a moment for the account to be created
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (fundError) {
        throw new Error(`Recipient account does not exist. We tried to create it automatically but failed: ${fundError instanceof Error ? fundError.message : 'Unknown error'}`);
      }
    }
    
    const sourceAccount = await server.loadAccount(sourcePublicKey);
    
    // Create a transaction record in our database first
    const { data: txRecord, error: txError } = await supabase
      .from('stellar_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'payment',
        stellar_tx_hash: 'pending-' + Date.now(), // Temporary hash
        from_asset: 'XLM',
        to_asset: 'XLM',
        amount: parseFloat(amount),
        fee: parseFloat(await config.getBaseFee()) / 10000000, // Convert from stroops to XLM
        status: 'pending',
        memo: memo || null,
        created_at: new Date().toISOString(),
        recipient_name: null, // We'll update this later if we have a name
      })
      .select()
      .single();
    
    if (txError) throw txError;
    
    // Get dynamic fee for Protocol 23 compatibility
    const fee = await config.getBaseFee();
    
    // Build the transaction with proper sequence number
    const transaction = new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase: network
    })
      .addOperation(Operation.payment({
        destination: destinationPublicKey,
        asset: asset,
        amount: amount
      }));
    
    // Add memo if provided
    if (memo) {
      transaction.addMemo(Memo.text(memo));
    }
    
    // Set timeout and build
    const builtTx = transaction.setTimeout(180).build();
    
    // Sign the transaction
    builtTx.sign(sourceKeypair);
    
    // Submit the transaction
    const result = await server.submitTransaction(builtTx);
    console.log('Payment successful:', result);
    
    // Update transaction record with successful status and hash
    if (txRecord) {
      await supabase
        .from('stellar_transactions')
        .update({
          stellar_tx_hash: result.hash,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', txRecord.id);
    }
    
    toast.success('Transaction submitted successfully!');
    hapticFeedback('success');
    
    // After 3 seconds, simulate recipient receiving the funds
    setTimeout(async () => {
      // Create a "received" transaction record for the recipient
      // This would typically happen on the recipient's device
      // but we're simulating it here for demonstration purposes
      if (txRecord) {
        // Update transaction status to indicate funds received
        await supabase
          .from('stellar_transactions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', txRecord.id);
        
        toast.success('Recipient has received your funds!');
        hapticFeedback('success');
      }
    }, 3000);
    
    return { 
      successful: true,
      hash: result.hash
    };
  } catch (error: any) {
    console.error('Payment error:', error);
      // Enhanced error handling
    let errorMessage = 'Your payment could not be processed. Please try again or contact support.';
    let errorCode = 'unknown_error';
    
    if (error.response) {
      const stellarResult = error.response.data.extras.result_codes;
      
      if (stellarResult.transaction === 'tx_insufficient_fee') {
        errorMessage = 'Your payment couldn\'t be processed. Please try again later.';
        errorCode = 'insufficient_fee';
      } else if (stellarResult.transaction === 'tx_insufficient_balance') {
        errorMessage = 'You don\'t have enough funds available for this payment.';
        errorCode = 'insufficient_balance';
      } else if (stellarResult.operations && stellarResult.operations.includes('op_underfunded')) {
        errorMessage = 'Insufficient funds available for this payment.';
        errorCode = 'operation_underfunded';      } else {
        errorMessage = 'Your payment couldn\'t be completed. Please try again later or contact support.';
        errorCode = stellarResult.transaction || 'tx_failed';
      }
    }
    
    toast.error(errorMessage);
    hapticFeedback('error');
    
    return { 
      successful: false,
      error: error instanceof Error ? error.message : 'Unknown error processing payment',
      errorCode: errorCode
    };
  }
}
