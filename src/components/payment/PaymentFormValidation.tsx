
import { FavoriteRecipient } from '@/types/favoriteRecipient';

export interface PaymentValidation {
  isValid: boolean;
  errors: {
    recipient?: string;
    amount?: string;
    balance?: string;
    address?: string;
    general?: string;
  };
}

export function validatePaymentForm(
  recipient: FavoriteRecipient | null,
  amount: string,
  fiatBalance: number,
  currentRate: number
): PaymentValidation {
  const errors: PaymentValidation['errors'] = {};
  
  // Recipient validation
  if (!recipient) {
    errors.recipient = 'Please select a recipient';
  } else if (!recipient.stellar_address) {
    errors.address = 'Recipient must have a valid Stellar address';
  } else if (!recipient.stellar_address.startsWith('G') || recipient.stellar_address.length !== 56) {
    errors.address = 'Invalid Stellar address format';
  }
  
  // Amount validation
  if (!amount || amount.trim() === '') {
    errors.amount = 'Please enter an amount';
  } else {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      errors.amount = 'Amount must be a positive number';
    } else if (amountNum < 0.01) {
      errors.amount = 'Minimum amount is 0.01';
    } else if (amountNum > fiatBalance) {
      errors.balance = 'Insufficient funds';
    } else if (currentRate <= 0) {
      errors.general = 'Exchange rates are currently unavailable';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function getStellarAddressValidationError(address: string): string | null {
  if (!address) return 'Stellar address is required';
  if (!address.startsWith('G')) return 'Stellar address must start with G';
  if (address.length !== 56) return 'Stellar address must be 56 characters long';
  if (!/^[A-Z0-9]+$/.test(address)) return 'Stellar address contains invalid characters';
  return null;
}
