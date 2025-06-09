
// Re-export all modules from a single entry point
import { createAccount, getAccountDetails } from './account';
import { sendPayment } from './payment';
import { encryptSecretKey, decryptSecretKey } from './security';
import { getTransactionHistory, getEnhancedTransactionHistory, trackTransaction, updateTransactionTimeline } from './history';
import { server, network, config } from './config';
import type { 
  StellarKeypair, 
  AccountDetails, 
  PaymentParams, 
  TransactionResult, 
  TransactionHistoryRecord,
  TransactionWithAccount,
  TransactionTimelineEvent,
  TestAccount
} from './types';

// Export types
export type {
  StellarKeypair,
  AccountDetails,
  PaymentParams,
  TransactionResult,
  TransactionHistoryRecord,
  TransactionWithAccount,
  TransactionTimelineEvent,
  TestAccount
};

// Export the StellarService object
export const StellarService = {
  // Account methods
  createAccount,
  getAccountDetails,
  
  // Payment methods
  sendPayment,
  
  // Security methods
  encryptSecretKey,
  decryptSecretKey,
  
  // History methods
  getTransactionHistory,
  getEnhancedTransactionHistory,
  trackTransaction,
  updateTransactionTimeline,
  
  // Configuration
  server,
  network,
  config
};

// Also export individual functions for direct imports
export {
  createAccount,
  getAccountDetails,
  sendPayment,
  encryptSecretKey,
  decryptSecretKey,
  getTransactionHistory,
  getEnhancedTransactionHistory,
  trackTransaction,
  updateTransactionTimeline,
  server,
  network,
  config
};
