import { supabase } from '@/integrations/supabase/client';

export const getStellarTransactions = async (userId: string) => {
  try {
    const { data: stellarTransactions, error } = await supabase
      .from('stellar_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stellar transactions:', error);
      return [];
    }

    return stellarTransactions || [];
  } catch (error) {
    console.error('Error getting stellar transactions:', error);
    return [];
  }
};

export const transformStellarTransactionToTransaction = (stellarTx: any): any => {
  return {
    id: stellarTx.id,
    amount: stellarTx.amount,
    currency: stellarTx.from_asset,
    description: stellarTx.memo || 'Stellar transaction',
    type: stellarTx.transaction_type,
    status: stellarTx.status,
    date: stellarTx.created_at,
    category: stellarTx.transfer_category || 'transfer',
    user_id: stellarTx.user_id,
    created_at: stellarTx.created_at,
    // Map recipient info from stellar transaction
    recipient_name: stellarTx.recipient_name,
    recipient_country: stellarTx.recipient_country,
    // Remove recipient_id references since they don't exist in the database
    transfer_purpose: stellarTx.transfer_purpose,
    fees_saved: stellarTx.fees_saved || 0,
    stellar_tx_hash: stellarTx.stellar_tx_hash
  };
};

export const getTransactionHistory = async (userId: string) => {
  try {
    const stellarTransactions = await getStellarTransactions(userId);
    const transactionHistory = stellarTransactions.map(transformStellarTransactionToTransaction);
    return transactionHistory;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
};

export const getTransactionDetails = async (transactionId: string) => {
  try {
    const { data: stellarTransaction, error } = await supabase
      .from('stellar_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      console.error('Error fetching stellar transaction:', error);
      return null;
    }

    if (!stellarTransaction) {
      console.log('Stellar transaction not found');
      return null;
    }

    return transformStellarTransactionToTransaction(stellarTransaction);
  } catch (error) {
    console.error('Error getting transaction details:', error);
    return null;
  }
};

// Fix the Transaction type reference
export interface StellarTransaction {
  id: string;
  user_id: string;
  stellar_tx_hash: string;
  transaction_type: string;
  amount: number;
  from_asset: string;
  to_asset: string;
  fee: number;
  memo?: string;
  status: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  recipient_name?: string;
  recipient_country?: string;
  transfer_purpose?: string;
  transfer_category?: string;
  fees_saved?: number;
}

// Update the function signature
export const enrichTransactionWithRecipientData = async (transaction: StellarTransaction): Promise<StellarTransaction> => {
  return transaction;
};
