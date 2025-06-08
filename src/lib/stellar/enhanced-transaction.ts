// Enhanced transaction recording system that tracks both sides of transactions
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';
import { TransactionStatus } from '@/lib/stellar/types';

export interface EnhancedTransactionRecord {
  user_id: string;
  stellar_tx_hash: string;
  transaction_type: 'payment' | 'received' | 'funding' | 'transfer';
  from_asset: string;
  to_asset: string;
  amount: number;
  fee: number;
  status?: string;
  created_at?: string;
  completed_at?: string | null;
  memo?: string | null;
  recipient_country?: string | null;
  recipient_name?: string | null;
  error_message?: string | null;
  fees_saved?: number | null;
  transfer_category?: string | null;
  transfer_purpose?: string | null;
  // id is optional for insert
  id?: string;
}

interface RecordTransactionOptions {
  recordReceipt?: boolean; // Whether to also record a received transaction for the recipient
  transactionId?: string; // Optional transaction ID to use instead of generating a new one
}

/**
 * Record a transaction in the database with enhanced metadata
 * This function handles both sides of a transaction, recording both sending and receiving sides
 * 
 * @param transaction - Transaction record to save
 * @param options - Options for transaction recording
 * @returns The ID of the created transaction record
 */
export async function recordEnhancedTransaction(
  transaction: EnhancedTransactionRecord,
  options: RecordTransactionOptions = {}
): Promise<string> {
  try {
    if (!transaction.user_id) {
      throw new Error('User ID is required');
    }
    if (!transaction.amount || transaction.amount <= 0) {
      throw new Error('Valid transaction amount is required');
    }
    if (!transaction.fee && transaction.fee !== 0) {
      throw new Error('Transaction fee is required');
    }
    if (!transaction.stellar_tx_hash) {
      throw new Error('stellar_tx_hash is required');
    }
    if (!transaction.from_asset || !transaction.to_asset) {
      throw new Error('Asset types are required');
    }
    if (!transaction.transaction_type) {
      throw new Error('Transaction type is required');
    }
    const timestamp = new Date().toISOString();
    const enhancedTransaction = {
      ...transaction,
      created_at: transaction.created_at || timestamp,
      completed_at: transaction.status === 'completed' ? (transaction.completed_at || timestamp) : null,
    };
    const { data, error } = await supabase
      .from('stellar_transactions')
      .insert(enhancedTransaction)
      .select()
      .single();
    if (error) {
      throw error;
    }
    // Record the received side of the transaction if requested
    if (options.recordReceipt && transaction.transaction_type === 'payment' && transaction.recipient_name) {
      try {
        // Try to find the recipient user based on their name (or use another identifier if available)
        // This is a placeholder; adapt as needed for your app's logic
        const { data: recipientUsers } = await supabase
          .from('favorite_recipients')
          .select('user_id')
          .eq('recipient_name', transaction.recipient_name)
          .limit(1);
        if (recipientUsers && recipientUsers.length > 0) {
          const recipientUserId = recipientUsers[0].user_id;
          const recipientTransaction: EnhancedTransactionRecord = {
            user_id: recipientUserId,
            stellar_tx_hash: transaction.stellar_tx_hash,
            transaction_type: 'received',
            from_asset: transaction.from_asset,
            to_asset: transaction.to_asset,
            amount: transaction.amount,
            fee: 0, // Recipient doesn't pay fees
            status: 'completed',
            created_at: timestamp,
            completed_at: timestamp,
            memo: transaction.memo,
            recipient_name: transaction.recipient_name,
          };
          await supabase
            .from('stellar_transactions')
            .insert(recipientTransaction);
        }
      } catch (receiptError) {
        console.error('Error recording received transaction:', receiptError);
      }
    }
    return data?.id;
  } catch (error) {
    console.error('Error recording enhanced transaction:', error);
    return '';
  }
}

/**
 * Update a transaction's status and timeline
 * 
 * @param transactionId - ID of the transaction to update
 * @param newStatus - New status to set
 * @returns True if update was successful
 */
export async function updateTransactionStatus(
  transactionId: string,
  newStatus: TransactionStatus
): Promise<boolean> {
  try {
    // Current timestamp
    const timestamp = new Date().toISOString();
    
    // Update the transaction
    const { error } = await supabase
      .from('stellar_transactions')
      .update({
        status: newStatus,
        ...(newStatus === 'completed' ? { completed_at: timestamp } : {})
      })
      .eq('id', transactionId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return false;
  }
}

/**
 * Get a specific transaction by ID
 * 
 * @param transactionId - ID of the transaction to retrieve
 * @returns The transaction record if found
 */
export async function getTransactionById(transactionId: string): Promise<EnhancedTransactionRecord | null> {
  try {
    const { data, error } = await supabase
      .from('stellar_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as EnhancedTransactionRecord;
  } catch (error) {
    console.error('Error getting transaction by ID:', error);
    return null;
  }
}
