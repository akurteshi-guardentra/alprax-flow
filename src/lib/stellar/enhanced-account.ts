// Enhanced utils for Stellar account creation without user interaction
import { Keypair } from 'stellar-sdk';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StellarAccount } from '@/lib/stellar/types';
import { server } from '@/lib/stellar/config';
import { encryptStellarSecret } from '../security/encryption';

/**
 * Create a Stellar account for a specific user without requiring their direct interaction
 * This is used for the Revolut-like experience where accounts are created behind the scenes
 */
export async function createStellarAccountForUser(userId: string): Promise<StellarAccount> {
  try {
    // Generate a new keypair
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();
    
    // Use proper encryption for the secret key
    const encryptedSecret = await encryptStellarSecret(secretKey);

    // Store the account in the database
    const { data, error } = await supabase
      .from('stellar_accounts')
      .insert({
        user_id: userId,
        public_key: publicKey,
        encrypted_secret: encryptedSecret,
        is_primary: true,
        account_name: 'Primary Account'
      })
      .select()
      .single();

    if (error) throw error;

    // Fund the account on testnet with retries so new users always start with a balance
    await fundWithFriendbot(publicKey, userId);


    // Return the account details
    return {
      id: data.id,
      publicKey: data.public_key,
      encryptedSecret: data.encrypted_secret,
    };
  } catch (error) {
    console.error('Error creating Stellar account:', error);
    throw new Error('Failed to create Stellar account');
  }
}

/**
 * Ensure a Stellar account has sufficient funds, funding it if necessary
 * This is used to make sure accounts can always send payments
 */
export async function ensureSufficientFunds(stellarAccount: StellarAccount): Promise<boolean> {
  try {
    // Check current balance
    const account = await server.loadAccount(stellarAccount.publicKey);
    const nativeBalance = account.balances.find(b => b.asset_type === 'native');
    
    if (nativeBalance && parseFloat(nativeBalance.balance) > 5) {
      // Already has sufficient funds
      return true;
    }
    
    // Need to fund the account
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${stellarAccount.publicKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fund account');
    }
    
    // Funding successful
    return true;
  } catch (error) {
    console.error('Error ensuring sufficient funds:', error);
    return false;
  }
}
