// Test utilities for Stellar functionality
// These functions are simplified versions for testing purposes

import { Keypair } from 'stellar-sdk';
import { StellarAccount } from '../lib/stellar/types';

/**
 * Create a test Stellar account without requiring authentication
 * This is a simpler version of the normal createAccount function 
 * that doesn't require Supabase authentication
 */
export function createTestAccount(): StellarAccount {
  // Generate a new random keypair
  const keypair = Keypair.random();
  const publicKey = keypair.publicKey();
  const secretKey = keypair.secret();
  
  // Use simple encoding (not for production)
  const encryptedSecret = btoa(secretKey);
  
  // Return the account details without storing in the database
  return {
    id: `test_${Math.random().toString(36).substring(2, 9)}`,
    publicKey,
    encryptedSecret
  };
}

/**
 * Fund a test account using Friendbot without requiring authentication
 * This bypasses the database recording functionality
 */
export async function fundTestAccountDirect(publicKey: string) {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${publicKey}`
    );
    
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
