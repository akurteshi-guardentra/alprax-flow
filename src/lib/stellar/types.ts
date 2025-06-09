
export interface StellarAccount {
  id: string;
  publicKey: string;
  encryptedSecret: string;
}

export interface StellarTransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export type TransactionStatus = 'initiated' | 'submitted' | 'pending' | 'completed' | 'failed' | 'received';

export interface TransactionTimelineEvent {
  status: TransactionStatus;
  timestamp: string;
  details?: any;
}

// New types for test accounts
export interface TestAccount {
  id: string;
  name: string;
  publicKey: string;
  encryptedSecret: string;
  balance: string;
  isActive: boolean;
  createdAt: string;
}

export interface TestAccountContextType {
  accounts: TestAccount[];
  activeAccount: TestAccount | null;
  createAccount: (name: string) => Promise<void>;
  switchAccount: (id: string) => void;
  fundAccount: (id: string) => Promise<void>;
  refreshBalance: (id: string) => Promise<void>;
  isLoading: boolean;
}
