
import { Keypair } from 'stellar-sdk';
import { TestAccount } from '../lib/stellar/types';

// Create a test account without requiring authentication
export function createTestAccount(): TestAccount {
  const keypair = Keypair.random();
  
  return {
    id: Math.random().toString(36).substring(2, 15),
    name: 'Test Account',
    publicKey: keypair.publicKey(),
    encryptedSecret: btoa(keypair.secret()), // Simple base64 encoding for testing
    balance: '0',
    isActive: false,
    createdAt: new Date().toISOString()
  };
}

// Fund test account directly using Stellar Friendbot
export async function fundTestAccountDirect(publicKey: string): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Funding failed: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('Funding response:', responseData);
    
    return { 
      success: true,
      hash: responseData.hash 
    };
  } catch (error) {
    console.error('Error funding testnet account:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error funding account'
    };
  }
}
