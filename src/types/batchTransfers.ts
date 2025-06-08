
export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BatchTransfer {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: BatchStatus;
  total_amount: number;
  recipient_count: number;
  created_at: string;
  processed_at?: string;
  error_message?: string;
}

export interface BatchTransferItem {
  id: string;
  batch_id: string;
  recipient_id: string;
  amount: number;
  status: BatchStatus;
  stellar_transaction_id?: string;
  error_message?: string;
}

export interface CreateBatchTransferInput {
  name: string;
  description?: string;
  transfers: {
    recipient_id: string;
    amount: number;
  }[];
}
