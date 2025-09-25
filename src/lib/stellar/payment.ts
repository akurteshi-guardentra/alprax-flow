
import { 
  Keypair, 
  TransactionBuilder, 
  Operation, 
  Asset, 
  Memo,
  MemoType
} from 'stellar-sdk';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';
import { server, networkPassphrase } from './config';
import { getAccount } from './account';

export interface PaymentParams {
  destinationAddress: string;
  amount: string;
  recipientName?: string;
  recipientId?: string;
  memo?: string;
  metadata?: {
    recipient_country?: string;
    transfer_purpose?: string;
    transfer_category?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  txHash?: string;
  errorType?: string;
}

export interface FundingResult {
  success: boolean;
  error?: string;
  hash?: string;
}

// Validate Stellar address format
function validateStellarAddress(address: string): boolean {
  return /^G[0-9A-Z]{55}$/.test(address);
}

export async function sendPayment(
  destinationAddress: string,
  amount: string,
  assetCode: string = 'XLM',
  recipientName?: string,
  recipientId?: string,
  memo?: string,
  metadata?: {
    recipient_country?: string;
    transfer_purpose?: string;
    transfer_category?: string;
  }
): Promise<PaymentResult> {
  try {
    console.log('=== Starting Payment Process ===');
    console.log('Destination:', destinationAddress);
    console.log('Amount:', amount, assetCode);
    console.log('Memo:', memo);
    console.log('Metadata:', metadata);

    // Validate Stellar address format
    if (!validateStellarAddress(destinationAddress)) {
      throw new Error('Invalid Stellar address format. Address should start with G and be 56 characters long.');
    }

    // Get the user's Stellar account
    const account = await getAccount();
    if (!account) {
      throw new Error('No Stellar account found. Please create an account first.');
    }

    console.log('Using account:', account.publicKey);

    // Decode the secret key
    const secretKey = atob(account.encryptedSecret);
    const sourceKeypair = Keypair.fromSecret(secretKey);
    
    // Load the source account from Stellar network, fund if needed
    let sourceAccount;
    try {
      sourceAccount = await server.loadAccount(account.publicKey);
      console.log('Source account loaded, sequence:', sourceAccount.sequenceNumber());
    } catch (error: any) {
      console.log('Account not found on network, attempting to fund...');
      
      // Try to fund the account
      const fundingResult = await fundTestAccount(account.publicKey);
      if (!fundingResult.success) {
        throw new Error('Account not found on network and funding failed. Please try adding test funds.');
      }
      
      console.log('Account funded, loading again...');
      // Wait a moment for the funding to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        sourceAccount = await server.loadAccount(account.publicKey);
        console.log('Source account loaded after funding, sequence:', sourceAccount.sequenceNumber());
      } catch (retryError) {
        throw new Error('Account funding succeeded but account still not available. Please try again in a moment.');
      }
    }

    // Verify destination account exists, auto-fund if needed
    try {
      await server.loadAccount(destinationAddress);
      console.log('Destination account verified');
    } catch (error) {
      console.log('Destination account not found, attempting to fund...');
      
      // Try to fund the recipient account
      const fundingResult = await fundTestAccount(destinationAddress);
      if (!fundingResult.success) {
        throw new Error(`Recipient account does not exist. We tried to create it automatically but failed: ${fundingResult.error}`);
      }
      
      console.log('Recipient account funded successfully');
      // Wait a moment for the funding to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        await server.loadAccount(destinationAddress);
        console.log('Destination account verified after funding');
      } catch (retryError) {
        throw new Error('Account funding succeeded but account still not available. Please try again in a moment.');
      }
    }

    // Get current user for database records
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create transaction record in database
    const { data: txRecord, error: txError } = await supabase
      .from('stellar_transactions')
      .insert({
        user_id: user.id,
        stellar_tx_hash: 'pending-' + Date.now(),
        transaction_type: 'payment',
        from_asset: assetCode,
        to_asset: assetCode,
        amount: parseFloat(amount),
        fee: 0.00001, // Standard Stellar fee
        status: 'pending',
        memo: memo || null,
        recipient_name: recipientName || null,
        recipient_country: metadata?.recipient_country || null,
        transfer_purpose: metadata?.transfer_purpose || null,
        transfer_category: metadata?.transfer_category || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (txError) {
      console.error('Database error:', txError);
      throw new Error('Failed to create transaction record');
    }

    console.log('Transaction record created:', txRecord.id);

    // Build the transaction
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100000', // 0.00001 XLM
      networkPassphrase: networkPassphrase
    })
    .addOperation(Operation.payment({
      destination: destinationAddress,
      asset: Asset.native(),
      amount: amount
    }));

    // Add memo if provided
    if (memo) {
      transaction.addMemo(Memo.text(memo));
    }

    // Build and sign the transaction
    const builtTransaction = transaction.setTimeout(180).build();
    builtTransaction.sign(sourceKeypair);

    console.log('Transaction built and signed');

    // Submit to Stellar network
    const result = await server.submitTransaction(builtTransaction);
    console.log('Transaction submitted successfully:', result.hash);

    // Update transaction record with success
    await supabase
      .from('stellar_transactions')
      .update({
        stellar_tx_hash: result.hash,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', txRecord.id);

    console.log('Transaction completed successfully');
    
    toast.success('Payment sent successfully!');
    hapticFeedback('success');

    return {
      success: true,
      txHash: result.hash
    };

  } catch (error: any) {
    console.error('Payment error:', error);
    
    let errorMessage = 'Payment failed. Please try again.';
    let errorType = 'unknown';
    
    if (error.response?.data?.extras?.result_codes) {
      const resultCodes = error.response.data.extras.result_codes;
      console.log('Stellar error codes:', resultCodes);
      
      if (resultCodes.transaction === 'tx_insufficient_balance') {
        errorMessage = 'You don\'t have enough XLM to complete this payment. Please add funds to your account.';
        errorType = 'insufficient_balance';
      } else if (resultCodes.transaction === 'tx_insufficient_fee') {
        errorMessage = 'Transaction fee is too low. This is usually a temporary network issue - please try again.';
        errorType = 'network_error';
      } else if (resultCodes.operations?.includes('op_underfunded')) {
        errorMessage = 'Insufficient funds for this payment amount. Please check your balance.';
        errorType = 'insufficient_balance';
      } else if (resultCodes.operations?.includes('op_no_destination')) {
        errorMessage = 'Recipient account does not exist. We can automatically activate it for them.';
        errorType = 'account_not_found';
      }
    } else if (error.message) {
      if (error.message.includes('Account not found')) {
        errorMessage = 'Your Stellar account needs to be activated. Please add test funds first.';
        errorType = 'account_not_found';
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        errorMessage = 'Network connection error. Please check your internet and try again.';
        errorType = 'network_error';
      } else {
        errorMessage = error.message;
      }
    }

    // Show user-friendly error message
    toast.error(errorMessage);
    hapticFeedback('error');

    return {
      success: false,
      error: errorMessage,
      errorType
    };
  }
}

export async function fundTestAccount(publicKey: string): Promise<FundingResult> {
  try {
    console.log('Funding test account:', publicKey);
    
    // Validate Stellar address format before funding
    if (!validateStellarAddress(publicKey)) {
      throw new Error('Invalid Stellar address format for funding');
    }
    
    // Enhanced retry mechanism for Friendbot with exponential backoff and jitter
    let retries = 5; // Increased from 3 to 5
    let delay = 1000; // Start with 1 second delay
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Account funded successfully:', result);
          
          return {
            success: true,
            hash: result.hash
          };
        } else if (response.status === 429) {
          // Rate limited, wait and retry with jitter
          const jitter = Math.random() * 500; // Add up to 500ms jitter
          const waitTime = delay + jitter;
          console.log(`Rate limited, retrying in ${Math.round(waitTime)}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          delay *= 2; // Exponential backoff
          continue;
        } else {
          // Get response text for better error diagnostics
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Friendbot error (${response.status}): ${errorText}`);
        }
      } catch (fetchError) {
        if (i === retries - 1) {
          throw fetchError; // Last retry, throw the error
        }
        const jitter = Math.random() * 500;
        const waitTime = delay + jitter;
        console.log(`Attempt ${i + 1} failed, retrying in ${Math.round(waitTime)}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        delay *= 2;
      }
    }
    
    throw new Error('All funding attempts failed');
  } catch (error) {
    console.error('Error funding account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error funding account'
    };
  }
}
