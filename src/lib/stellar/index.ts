
// Re-export individual functions from modules
import { createAccount, getAccount } from './account';
import { sendPayment, fundTestAccount } from './payment';
import { getBalance, checkAddressExists } from './utils';
import { server, networkPassphrase } from './config';

// Export types properly
export type { StellarAccount, StellarTransactionResult } from './types';

// Export the main stellar object with all functions
export const stellar = {
  // Account functions
  createAccount,
  getAccount,
  
  // Payment functions
  sendPayment,
  fundTestAccount,
  
  // Utility functions
  getBalance,
  checkAddressExists,
};

// Export individual components for direct imports
export {
  createAccount,
  getAccount,
  sendPayment,
  fundTestAccount,
  getBalance,
  checkAddressExists,
  server,
  networkPassphrase
};
