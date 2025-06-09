// Types for the Stellar service
export interface StellarKeypair {
  publicKey: string;
  secretKey: string;
}

export interface AccountDetails {
  id: string;
  balances: Array<{
    asset_type: string;
    asset_code?: string;
    balance: string;
  }>;
  sequence: string;
  // Other account details as needed
}

export interface PaymentParams {
  sourceSecretKey: string;
  destinationPublicKey: string;
  amount: string;
  asset?: any;
  memo?: string;
}

export interface TransactionResult {
  hash?: string;
  successful: boolean;
  error?: string;
  errorCode?: string;
}

export interface TransactionHistoryRecord {
  id: string;
  hash: string;
  created_at: string;
  successful: boolean;
  source_account: string;
  // Other transaction details as needed
}

export type TransactionStatus = 'initiated' | 'submitted' | 'pending' | 'completed' | 'failed' | 'received';

export interface TransactionTimelineEvent {
  status: TransactionStatus;
  timestamp: string;
  details?: any;
}

export interface TransactionWithAccount {
  id: string;
  hash: string;
  created_at: string;
  amount: string;
  asset_type: string;
  successful: boolean;
  status: string;
  transaction_type: 'sent' | 'received' | 'funding';
  from_address: string;
  to_address: string;
  memo?: string;
  recipient_name?: string;
  timeline?: TransactionTimelineEvent[];
}

export interface TestAccount {
  id: string;
  name: string;
  publicKey: string;
  encryptedSecret: string;
  isActive: boolean;
}
