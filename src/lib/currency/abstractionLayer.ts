/**
 * Currency Abstraction Layer
 * Handles conversion between fiat and XLM without exposing blockchain details
 */

import { supabase } from '@/integrations/supabase/client';

// Default exchange rates (fallback if API fails)
const DEFAULT_RATES = {
  USD: 0.12, // 1 XLM = $0.12
  EUR: 0.11,
  GBP: 0.09,
};

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP';

/**
 * Get current XLM exchange rates
 * Updates every 5 minutes via cache
 */
export async function getExchangeRates(): Promise<Record<SupportedCurrency, number>> {
  try {
    // Try to fetch from external API
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd,eur,gbp');
    const data = await response.json();
    
    if (data?.stellar) {
      return {
        USD: data.stellar.usd,
        EUR: data.stellar.eur,
        GBP: data.stellar.gbp,
      };
    }
  } catch (error) {
    console.warn('Failed to fetch exchange rates, using defaults:', error);
  }
  
  return DEFAULT_RATES;
}

/**
 * Convert fiat amount to XLM (internal use only)
 * @param fiatAmount - Amount in fiat currency
 * @param currency - Fiat currency code
 * @returns XLM amount (hidden from user)
 */
export async function convertFiatToXLM(
  fiatAmount: number,
  currency: SupportedCurrency = 'USD'
): Promise<number> {
  const rates = await getExchangeRates();
  const xlmRate = rates[currency];
  
  // Calculate XLM amount (7 decimal places for precision)
  const xlmAmount = Number((fiatAmount / xlmRate).toFixed(7));
  
  console.log(`[INTERNAL] Converting ${fiatAmount} ${currency} → ${xlmAmount} XLM @ rate ${xlmRate}`);
  
  return xlmAmount;
}

/**
 * Convert XLM to fiat amount (for display only)
 * @param xlmAmount - XLM amount (from blockchain)
 * @param currency - Target fiat currency
 * @returns Fiat amount for user display
 */
export async function convertXLMToFiat(
  xlmAmount: number,
  currency: SupportedCurrency = 'USD'
): Promise<number> {
  const rates = await getExchangeRates();
  const xlmRate = rates[currency];
  
  // Calculate fiat amount (2 decimal places for display)
  const fiatAmount = Number((xlmAmount * xlmRate).toFixed(2));
  
  return fiatAmount;
}

/**
 * Get user's preferred currency from profile
 * TODO: Phase 3 - Add preferred_currency column to profiles table
 */
export async function getUserPreferredCurrency(): Promise<SupportedCurrency> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'USD';
    
    // TODO: Phase 3 - Query preferred_currency from profiles
    // For now, default to USD
    return 'USD';
  } catch (error) {
    return 'USD';
  }
}

/**
 * Format amount for display (always fiat)
 */
export function formatFiatAmount(amount: number, currency: SupportedCurrency = 'USD'): string {
  const symbols: Record<SupportedCurrency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  
  return `${symbols[currency]}${amount.toFixed(2)}`;
}

/**
 * Generate user-friendly confirmation ID
 */
export function generateConfirmationId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'CNF-';
  for (let i = 0; i < 10; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Generate user-friendly account ID
 */
export function generateAccountId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'ALF-';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
