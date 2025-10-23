/**
 * User-Facing Payment Service
 * Handles payments in fiat currency, hiding all XLM/Stellar operations
 */

import { supabase } from '@/integrations/supabase/client';
import { sendPayment } from '@/lib/stellar/payment';
import { checkAddressExists } from '@/lib/stellar/utils';
import { fundTestAccount } from '@/lib/stellar/payment';
import { 
  convertFiatToXLM, 
  convertXLMToFiat, 
  getUserPreferredCurrency,
  generateConfirmationId,
  type SupportedCurrency 
} from '@/lib/currency/abstractionLayer';
import { decryptStellarSecret } from '@/lib/security/encryption';
import { Keypair } from 'stellar-sdk';
import { toast } from 'sonner';

export interface UserPaymentParams {
  recipientId: string; // User ID or email
  amount: number; // Fiat amount
  currency?: SupportedCurrency;
  memo?: string;
}

export interface UserPaymentResult {
  success: boolean;
  confirmationId?: string;
  timestamp: string;
  error?: string;
}

export class AbstractPaymentService {
  /**
   * Send payment using fiat amount
   * XLM conversion happens internally
   */
  static async sendPayment(params: UserPaymentParams): Promise<UserPaymentResult> {
    try {
      const { recipientId, amount, currency, memo } = params;
      
      // 1. Get current user's Stellar account (hidden)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data: senderAccount } = await supabase
        .from('stellar_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .limit(1)
        .single();
      
      if (!senderAccount) throw new Error('No account found');
      
      // 2. Resolve recipient's Stellar address (hidden)
      const recipientAddress = await this.resolveRecipientAddress(recipientId);
      if (!recipientAddress) throw new Error('Recipient not found');
      
      // 3. Convert fiat to XLM (hidden)
      const userCurrency = currency || await getUserPreferredCurrency();
      const xlmAmount = await convertFiatToXLM(amount, userCurrency);
      
      console.log(`[INTERNAL] Sending ${amount} ${userCurrency} (${xlmAmount} XLM) to ${recipientAddress}`);
      
      // 4. Check if recipient account exists, fund if needed
      const recipientExists = await checkAddressExists(recipientAddress);
      if (!recipientExists) {
        console.log('[INTERNAL] Recipient account not active, funding...');
        await fundTestAccount(recipientAddress);
        // Wait for account to be funded
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // 5. Decrypt sender's secret key (hidden)
      const secretKey = await decryptStellarSecret(senderAccount.encrypted_secret);
      const senderKeypair = Keypair.fromSecret(secretKey);
      
      // 6. Execute Stellar payment (hidden)
      const { sendPayment: sendPaymentLegacy } = await import('@/lib/stellar/payment');
      const stellarResult = await sendPaymentLegacy({
        destinationAddress: recipientAddress,
        amount: xlmAmount.toString(),
        memo: memo || '',
      });
      
      if (!stellarResult.success) {
        throw new Error(stellarResult.error || 'Payment failed');
      }
      
      // 7. Generate confirmation ID (Phase 3 will store in database)
      const confirmationId = generateConfirmationId();
      
      // TODO: Phase 3 - Update transaction record with fiat details once columns are added:
      // fiat_amount, fiat_currency, exchange_rate_at_time, confirmation_id
      
      // 8. Return user-friendly result (no blockchain details)
      return {
        success: true,
        confirmationId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Payment Error]', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  /**
   * Resolve recipient identifier to Stellar address
   * @param identifier - User ID, email, or account ID
   * @returns Stellar public key (internal use only)
   */
  private static async resolveRecipientAddress(identifier: string): Promise<string | null> {
    try {
      // Try as UUID first (user ID)
      const { data: accountByUserId } = await supabase
        .from('stellar_accounts')
        .select('public_key')
        .eq('user_id', identifier)
        .order('is_primary', { ascending: false })
        .limit(1)
        .single();
      
      if (accountByUserId) return accountByUserId.public_key;
      
      // Try as email
      const { data: userByEmail } = await supabase.rpc('find_user_by_email', {
        search_email: identifier
      });
      
      if (userByEmail && userByEmail.length > 0) {
        const userId = userByEmail[0].user_id;
        const { data: accountByEmail } = await supabase
          .from('stellar_accounts')
          .select('public_key')
          .eq('user_id', userId)
          .order('is_primary', { ascending: false })
          .limit(1)
          .single();
        
        if (accountByEmail) return accountByEmail.public_key;
      }
      
      // Try as Stellar address directly (fallback)
      if (identifier.startsWith('G') && identifier.length === 56) {
        return identifier;
      }
      
      return null;
    } catch (error) {
      console.error('Error resolving recipient address:', error);
      return null;
    }
  }
  
  /**
   * Get user's balance in fiat currency
   */
  static async getBalance(userId?: string): Promise<{ amount: number; currency: SupportedCurrency }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) throw new Error('User not authenticated');
      
      // Get Stellar account
      const { data: account } = await supabase
        .from('stellar_accounts')
        .select('public_key')
        .eq('user_id', targetUserId)
        .order('is_primary', { ascending: false })
        .limit(1)
        .single();
      
      if (!account) return { amount: 0, currency: 'USD' };
      
      // Get XLM balance from network (hidden)
      const { getBalance } = await import('@/lib/stellar/utils');
      const balances = await getBalance(account.public_key);
      const xlmBalance = balances.find(b => b.asset === 'XLM');
      
      if (!xlmBalance) return { amount: 0, currency: 'USD' };
      
      // Convert to fiat
      const userCurrency = await getUserPreferredCurrency();
      const fiatAmount = await convertXLMToFiat(parseFloat(xlmBalance.balance), userCurrency);
      
      return {
        amount: fiatAmount,
        currency: userCurrency,
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      return { amount: 0, currency: 'USD' };
    }
  }
}
