
// Transaction Flow Test Script
// This script provides a step-by-step process to test the transaction flow

import { getEnhancedTransactionHistory } from '../services/stellar/history';
import { server } from '../lib/stellar/config';
import { createTestAccount, fundTestAccountDirect } from './stellarTestUtils';
import { ensureTestUser } from './helpers/testAuth';

async function fetchAccountBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(b => b.asset_type === 'native');
    return nativeBalance?.balance || '0';
  } catch (error) {
    console.error('Error fetching account balance:', error);
    return '0';
  }
}

async function sendPaymentDirect(senderKeypair: any, recipientPublicKey: string, amount: string) {
  try {
    const { TransactionBuilder, Operation, Asset, Memo } = await import('stellar-sdk');
    const { networkPassphrase } = await import('../lib/stellar/config');
    
    // Get account details from network
    const sourceAccount = await server.loadAccount(senderKeypair.publicKey());
    
    // Get the transaction fee
    const fee = (await server.fetchBaseFee()).toString();
    
    // Build the transaction
    const transaction = new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: recipientPublicKey,
          asset: Asset.native(),
          amount: amount,
        })
      )
      .addMemo(Memo.text('Test payment'))
      .setTimeout(30)
      .build();
    
    // Sign and submit transaction
    transaction.sign(senderKeypair);
    const result = await server.submitTransaction(transaction);
    
    return {
      success: true,
      hash: result.hash
    };
  } catch (error) {
    console.error('Error sending payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testTransactionFlow() {
  console.log('🧪 Starting Transaction Flow Test');
  console.log('---------------------------------');

  // Authentication step
  try {
    await ensureTestUser();
  } catch (error) {
    console.error('❌ Authentication failed, cannot continue with tests:', error);
    return;
  }

  // Step 1: Create a sender account
  console.log('Step 1: Creating sender account');
  const senderAccount = createTestAccount();
  console.log(`✅ Created sender account: ${senderAccount.publicKey}`);

  // Step 2: Fund the sender account
  console.log('\nStep 2: Funding sender account');
  try {
    const fundResult = await fundTestAccountDirect(senderAccount.publicKey);
    console.log(`✅ Funded sender account: ${fundResult.success}`);
    
    // Check balance after funding
    const senderBalance = await fetchAccountBalance(senderAccount.publicKey);
    console.log(`💰 Sender Balance: ${senderBalance} XLM`);
  } catch (error) {
    console.error('❌ Failed to fund sender account:', error);
    return;
  }

  // Step 3: Create a recipient account
  console.log('\nStep 3: Creating recipient account');
  const recipientAccount = createTestAccount();
  console.log(`✅ Created recipient account: ${recipientAccount.publicKey}`);

  // Step 4: Fund the recipient account (to activate it)
  console.log('\nStep 4: Funding recipient account');
  try {
    const fundResult = await fundTestAccountDirect(recipientAccount.publicKey);
    console.log(`✅ Funded recipient account: ${fundResult.success}`);
    
    // Check balance after funding
    const recipientBalance = await fetchAccountBalance(recipientAccount.publicKey);
    console.log(`💰 Recipient Initial Balance: ${recipientBalance} XLM`);
  } catch (error) {
    console.error('❌ Failed to fund recipient account:', error);
    return;
  }

  // Step 5: Send payment from sender to recipient
  console.log('\nStep 5: Sending payment from sender to recipient');
  try {
    // Use atob for basic decoding of the secret key (for testing only)
    const senderSecret = atob(senderAccount.encryptedSecret);
    const amount = '50'; // Send 50 XLM
    
    // Use the imported Keypair to create a keypair from the secret
    const { Keypair } = await import('stellar-sdk');
    const senderKeypair = Keypair.fromSecret(senderSecret);
    
    const paymentResult = await sendPaymentDirect(
      senderKeypair,
      recipientAccount.publicKey,
      amount
    );
    
    console.log(`✅ Payment sent: ${paymentResult.success}`);
    console.log(`🔍 Transaction hash: ${paymentResult.hash}`);
  } catch (error) {
    console.error('❌ Failed to send payment:', error);
    return;
  }

  // Step 6: Check sender balance after payment
  console.log('\nStep 6: Checking sender balance after payment');
  try {
    const senderBalance = await fetchAccountBalance(senderAccount.publicKey);
    console.log(`💰 Sender Balance After Payment: ${senderBalance} XLM`);
  } catch (error) {
    console.error('❌ Failed to check sender balance:', error);
  }

  // Step 7: Check recipient balance after payment
  console.log('\nStep 7: Checking recipient balance after payment');
  try {
    const recipientBalance = await fetchAccountBalance(recipientAccount.publicKey);
    console.log(`💰 Recipient Balance After Payment: ${recipientBalance} XLM`);
  } catch (error) {
    console.error('❌ Failed to check recipient balance:', error);
  }

  // Step 8: Check transaction history
  console.log('\nStep 8: Checking transaction history');
  try {
    console.log('Sender transaction history:');
    const senderTransactions = await getEnhancedTransactionHistory(senderAccount.publicKey);
    console.log(`Found ${senderTransactions.length} transactions for sender`);
    
    if (senderTransactions.length > 0) {
      console.log('Latest sender transaction:');
      console.log('- Type:', senderTransactions[0].transaction_type);
      console.log('- Amount:', senderTransactions[0].amount);
      console.log('- Status:', senderTransactions[0].status);
      console.log('- Recipient:', senderTransactions[0].recipient_name);
    }
    
    console.log('\nRecipient transaction history:');
    const recipientTransactions = await getEnhancedTransactionHistory(recipientAccount.publicKey);
    console.log(`Found ${recipientTransactions.length} transactions for recipient`);
    
    if (recipientTransactions.length > 0) {
      console.log('Latest recipient transaction:');
      console.log('- Type:', recipientTransactions[0].transaction_type);
      console.log('- Amount:', recipientTransactions[0].amount);
      console.log('- Status:', recipientTransactions[0].status);
      console.log('- Memo:', recipientTransactions[0].memo);
    }
  } catch (error) {
    console.error('❌ Failed to check transaction history:', error);
  }

  console.log('\n---------------------------------');
  console.log('🏁 Transaction Flow Test Complete');
}

// Execute the test
testTransactionFlow().catch(error => {
  console.error('Test failed with error:', error);
});
