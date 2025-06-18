
export interface PaymentFormData {
  recipient: FavoriteRecipient | null;
  amount: string;
  memo: string;
  currency: 'EUR' | 'USD' | 'GBP';
}

export interface PaymentResult {
  success: boolean;
  hash?: string;
  error?: string;
  timestamp?: string;
}

export interface ExchangeRate {
  EUR: number;
  USD: number;
  GBP: number;
}

export interface PaymentMetadata {
  recipient_country: string;
  transfer_purpose: string;
  transfer_category: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaymentContext {
  isProcessing: boolean;
  balance: number;
  rates: ExchangeRate;
  ratesLoading: boolean;
}

import { FavoriteRecipient } from './favoriteRecipient';
