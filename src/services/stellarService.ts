
// This file now just re-exports from the refactored modules
// to maintain backwards compatibility
export { StellarService } from './stellar';
export type { 
  StellarKeypair, 
  AccountDetails, 
  PaymentParams, 
  TransactionResult, 
  TransactionHistoryRecord 
} from './stellar/types';

