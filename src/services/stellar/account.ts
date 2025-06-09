
import { Keypair } from 'stellar-sdk';
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";
import { server } from './config';
import { StellarKeypair, AccountDetails } from './types';

/**
 * Creates a new Stellar account on the testnet
 * @returns {Promise<StellarKeypair>}
 */
export async function createAccount(): Promise<StellarKeypair> {
  try {
    // Generate a new keypair
    const pair = Keypair.random();
    const publicKey = pair.publicKey();
    const secretKey = pair.secret();
    
    // Fund the account using friendbot (testnet only)
    if (import.meta.env.VITE_STELLAR_NETWORK === 'TESTNET') {
      await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
      console.log('Account funded via Friendbot');
    }
    
    return {
      publicKey,
      secretKey
    };
  } catch (error) {
    console.error('Error creating Stellar account:', error);
    hapticFeedback('error');
    throw new Error('Failed to create Stellar account');
  }
}

/**
 * Gets account details including balances
 * @param {string} publicKey - Account public key
 * @returns {Promise<AccountDetails>} - Account details
 */
export async function getAccountDetails(publicKey: string): Promise<AccountDetails> {
  try {
    // Load account using Stellar SDK
    const account = await server.loadAccount(publicKey);
    
    // Convert AccountResponse to our AccountDetails type
    const accountDetails: AccountDetails = {
      id: account.accountId(),
      sequence: account.sequenceNumber(),
      balances: account.balances.map((balance: any) => ({
        asset_type: balance.asset_type,
        asset_code: balance.asset_code,
        balance: balance.balance
      }))
    };
    
    return accountDetails;
  } catch (error) {
    console.error('Error loading account:', error);
    hapticFeedback('error');
    throw new Error('Failed to load account details');
  }
}
