// Transaction Flow Test Script
// This script provides a step-by-step process to test the transaction flow

import { sendPayment } from '../lib/stellar/payment';
import { server } from '../lib/stellar/config';
import { createTestAccount, fundTestAccountDirect } from './stellarTestUtils';
import { Keypair, TransactionBuilder, Operation, Asset, Networks } from 'stellar-sdk';

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

// Direct payment function that doesn't rely on database
export async function sendPaymentDirect(
  sourceKeypair: Keypair,
  destinationId: string,
  amount: string
) {
  try {
    console.log(`Sending direct payment to ${destinationId} with amount ${amount} XLM`);
    
    // Get account details from network
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    // Get the transaction fee
    const fee = (await server.fetchBaseFee()).toString();

    // Build the transaction
    const transaction = new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: destinationId,
          asset: Asset.native(), // Using XLM
          amount: amount,
        })
      )
      .setTimeout(30)
      .build();

    // Sign and submit transaction
    transaction.sign(sourceKeypair);
    console.log('Submitting transaction to Stellar network...');
    const result = await server.submitTransaction(transaction);
    console.log('Transaction successful:', result);
    
    return {
      success: true,
      hash: result.hash
    };
  } catch (error: any) {
    console.error('Error sending payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending payment'
    };
  }
}

async function testDirectTransactionFlow() {
  console.log('🧪 Starting Direct Transaction Flow Test');
  console.log('---------------------------------');

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
    // Decode the secret key
    const senderSecret = atob(senderAccount.encryptedSecret);
    const senderKeypair = Keypair.fromSecret(senderSecret);
    const amount = '50'; // Send 50 XLM
    
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

  console.log('\n---------------------------------');
  console.log('🏁 Direct Transaction Flow Test Complete');
}

// Execute the test
testDirectTransactionFlow().catch(error => {
  console.error('Test failed with error:', error);
});
