/**
 * User-Facing Account Service
 * Manages accounts without exposing Stellar details
 */

import { supabase } from '@/integrations/supabase/client';
import { createStellarAccountForUser } from '@/lib/stellar/enhanced-account';
import { 
  convertXLMToFiat, 
  getUserPreferredCurrency,
  generateAccountId,
  type SupportedCurrency 
} from '@/lib/currency/abstractionLayer';

export interface UserAccount {
  accountId: string; // User-friendly ID (ALF-XXXXXXXX)
  balance: number; // Fiat amount
  currency: SupportedCurrency;
  createdAt: string;
  status: 'active' | 'pending' | 'inactive';
}

export class AbstractAccountService {
  /**
   * Create account for new user
   * Stellar account creation happens silently
   */
  static async createAccount(userId: string): Promise<UserAccount> {
    try {
      // 1. Create Stellar account (hidden operation)
      console.log('[INTERNAL] Creating Stellar account...');
      const stellarAccount = await createStellarAccountForUser(userId);
      
      // 2. Generate user-friendly account ID
      const accountId = generateAccountId();
      
      // TODO: Phase 3 - Store accountId in profiles table once user_account_id column is added
      // For now, we'll generate it on-demand
      
      // 4. Get initial balance (should be ~10,000 XLM from friendbot)
      const { getBalance } = await import('@/lib/stellar/utils');
      const balances = await getBalance(stellarAccount.publicKey);
      const xlmBalance = balances.find(b => b.asset === 'XLM');
      
      const userCurrency = await getUserPreferredCurrency();
      const fiatBalance = xlmBalance 
        ? await convertXLMToFiat(parseFloat(xlmBalance.balance), userCurrency)
        : 0;
      
      // 5. Return user-friendly account details
      return {
        accountId,
        balance: fiatBalance,
        currency: userCurrency,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
    } catch (error) {
      console.error('Error creating account:', error);
      throw new Error('Failed to create account');
    }
  }
  
  /**
   * Get account details for user
   */
  static async getAccount(userId?: string): Promise<UserAccount | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return null;
      
      // TODO: Phase 3 - Get account ID and preferred currency from profiles
      // For now, generate account ID on-demand
      const accountId = generateAccountId();
      
      // Get Stellar account (hidden)
      const { data: stellarAccount } = await supabase
        .from('stellar_accounts')
        .select('public_key, created_at')
        .eq('user_id', targetUserId)
        .order('is_primary', { ascending: false })
        .limit(1)
        .single();
      
      if (!stellarAccount) return null;
      
      // Get balance from network (hidden)
      const { getBalance } = await import('@/lib/stellar/utils');
      const balances = await getBalance(stellarAccount.public_key);
      const xlmBalance = balances.find(b => b.asset === 'XLM');
      
      const userCurrency = await getUserPreferredCurrency();
      const fiatBalance = xlmBalance 
        ? await convertXLMToFiat(parseFloat(xlmBalance.balance), userCurrency)
        : 0;
      
      return {
        accountId: accountId,
        balance: fiatBalance,
        currency: userCurrency,
        createdAt: stellarAccount.created_at,
        status: 'active',
      };
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }
  
  /**
   * Update user's preferred currency
   * TODO: Phase 3 - Implement once preferred_currency column is added to profiles
   */
  static async updatePreferredCurrency(
    userId: string, 
    currency: SupportedCurrency
  ): Promise<boolean> {
    console.log(`[TODO Phase 3] Update preferred currency to ${currency} for user ${userId}`);
    // TODO: Phase 3 - Implement database update
    return true;
  }
}
