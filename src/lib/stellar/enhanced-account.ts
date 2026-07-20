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
 * Fund a Stellar public key via Friendbot with retries.
 * Ensures every new user starts with a default balance even when
 * Friendbot is rate-limited or briefly unavailable.
 */
async function fundWithFriendbot(publicKey: string, userId: string): Promise<boolean> {
  const MAX_ATTEMPTS = 4;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
      if (response.ok) {
        const body = await response.json();
        if (body?.hash) {
          const timestamp = new Date().toISOString();
          await supabase.from('stellar_transactions').insert({
            user_id: userId,
            stellar_tx_hash: body.hash,
            transaction_type: 'funding',
            from_asset: 'XLM',
            to_asset: 'XLM',
            amount: 10000,
            fee: 0,
            status: 'completed',
            created_at: timestamp,
            completed_at: timestamp,
            memo: 'Welcome bonus - account activation',
          });
        }
        return true;
      }
      // 429 or transient: backoff and retry
      await new Promise(r => setTimeout(r, 1000 * attempt));
    } catch (err) {
      console.error(`[Friendbot] attempt ${attempt} failed:`, err);
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  console.error('[Friendbot] All funding attempts failed for', publicKey);
  return false;
}

/**
 * Ensure a Stellar account has sufficient funds, funding it if necessary
 * This is used to make sure accounts can always send payments
 */
export async function ensureSufficientFunds(stellarAccount: StellarAccount, userId?: string): Promise<boolean> {
  try {
    // Check current balance
    let hasFunds = false;
    try {
      const account = await server.loadAccount(stellarAccount.publicKey);
      const nativeBalance = account.balances.find(b => b.asset_type === 'native');
      hasFunds = !!nativeBalance && parseFloat(nativeBalance.balance) > 5;
    } catch {
      // Account not found on network yet - needs funding
      hasFunds = false;
    }

    if (hasFunds) return true;

    // Resolve user id if not provided
    let uid = userId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      uid = user?.id;
    }
    if (!uid) return false;

    return await fundWithFriendbot(stellarAccount.publicKey, uid);
  } catch (error) {
    console.error('Error ensuring sufficient funds:', error);
    return false;
  }
}

