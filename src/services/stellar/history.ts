import { server } from './config';
import { TransactionHistoryRecord, TransactionWithAccount, TransactionTimelineEvent } from './types';
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";
import { supabase } from '@/integrations/supabase/client';

/**
 * Get transaction history for an account
 * @param {string} publicKey - Account public key
 * @param {number} limit - Maximum number of records to retrieve
 * @returns {Promise<TransactionHistoryRecord[]>} - Transaction history records
 */
export async function getTransactionHistory(publicKey: string, limit = 10): Promise<TransactionHistoryRecord[]> {
  try {
    const transactions = await server
      .transactions()
      .forAccount(publicKey)
      .limit(limit)
      .order('desc')
      .call();
    
    return transactions.records as TransactionHistoryRecord[];
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw new Error('Failed to fetch transaction history');
  }
}

/**
 * Get enhanced transaction history from both Stellar network and local database
 * @param {string} publicKey - Account public key
 * @returns {Promise<TransactionWithAccount[]>} - Enhanced transaction records
 */
export async function getEnhancedTransactionHistory(publicKey: string): Promise<TransactionWithAccount[]> {
  try {
    // Get the user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    console.log('Fetching enhanced transaction history for account:', publicKey);
      // Get transactions from local database for cleaner history with recipient information
    // Try to get transactions without the join first to avoid potential foreign key issues
    const { data: localTransactions, error } = await supabase
      .from('stellar_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions from database:', error);
      // Don't throw the error, return empty array instead to avoid breaking the UI
      return [];
    }
    
    // If we have recipient_id values, try to fetch recipient details separately
    // This avoids foreign key relationship errors
    let recipientDetails = {};
    
    try {
      const recipientIds = localTransactions
        ?.filter(tx => tx.recipient_id)
        .map(tx => tx.recipient_id)
        .filter((id, index, self) => id && self.indexOf(id) === index); // Get unique IDs
        
      if (recipientIds && recipientIds.length > 0) {
        const { data: recipients } = await supabase
          .from('favorite_recipients')
          .select('id, recipient_name, stellar_address, country, currency')
          .in('id', recipientIds);
          
        if (recipients) {
          recipientDetails = recipients.reduce((acc, recipient) => {
            acc[recipient.id] = recipient;
            return acc;
          }, {});
        }
      }
    } catch (recipientError) {
      console.warn('Error fetching recipient details:', recipientError);
      // Continue without recipient details
    }
      console.log('Retrieved transactions:', localTransactions?.length || 0);
    
    // Transform database records to our transaction format
    const enhancedTransactions: TransactionWithAccount[] = (localTransactions || []).map((tx: any) => {
      // If we have recipient details for this transaction, add them
      if (tx.recipient_id && recipientDetails[tx.recipient_id]) {
        tx.recipient_details = recipientDetails[tx.recipient_id];
      }
      
      // Define default timeline events
      let timeline: TransactionTimelineEvent[] = [];
      
      // For sent payments
      if (tx.transaction_type === 'payment') {
        timeline = [
          { status: 'initiated', timestamp: tx.created_at },
        ];
        
        // Add submitted status if available
        if (tx.submitted_at) {
          timeline.push({ status: 'submitted', timestamp: tx.submitted_at });
        }
        
        // Add pending status (can be simulated between submission and completion)
        if (tx.submitted_at) {
          const pendingTime = new Date(tx.submitted_at);
          pendingTime.setSeconds(pendingTime.getSeconds() + 2); // 2 seconds after submission
          timeline.push({ status: 'pending', timestamp: pendingTime.toISOString() });
        }
      }
        // For received payments
      else if (tx.transaction_type === 'received') {
        // For received transactions, start at pending
        const pendingTime = new Date(tx.created_at);
        pendingTime.setSeconds(pendingTime.getSeconds() - 3); // 3 seconds before creation
        timeline = [
          { status: 'pending', timestamp: pendingTime.toISOString() },
        ];
      }
      
      // For funding transactions
      else if (tx.transaction_type === 'funding') {
        timeline = [
          { status: 'initiated', timestamp: tx.created_at },
          { status: 'submitted', timestamp: tx.created_at },
        ];
        
        // Add pending status 1 second later
        const pendingTime = new Date(tx.created_at);
        pendingTime.setSeconds(pendingTime.getSeconds() + 1);
        timeline.push({ status: 'pending', timestamp: pendingTime.toISOString() });
      }
      
      // Add completed status if the transaction is completed
      if (tx.status === 'completed' && tx.completed_at) {
        timeline.push({ status: 'completed', timestamp: tx.completed_at });
          // For received transactions, add the "received" step
        if (tx.transaction_type === 'received') {
          const receivedTime = new Date(tx.completed_at);
          receivedTime.setSeconds(receivedTime.getSeconds() + 1);
          timeline.push({ status: 'received', timestamp: receivedTime.toISOString() });
        }
      }
        // Determine transaction type mapping
      let transactionType: 'sent' | 'received' | 'funding';
      if (tx.transaction_type === 'payment') {
        transactionType = 'sent';
      } else if (tx.transaction_type === 'received') {
        transactionType = 'received';
      } else if (tx.transaction_type === 'funding') {
        transactionType = 'funding';
      } else {
        // Default to 'sent' for any other types, but log for debugging
        console.warn('Unknown transaction type:', tx.transaction_type);
        transactionType = 'sent';
      }

      // Handle recipient details safely, checking if it exists and is properly structured
      let recipientAddress = tx.recipient_address || '';
      let recipientName = tx.recipient_name || '';
      
      if (tx.recipient_details) {
        // Handle as an object or an array safely
        if (Array.isArray(tx.recipient_details) && tx.recipient_details.length > 0) {
          const recipient = tx.recipient_details[0];
          if (recipient) {
            recipientAddress = recipient.stellar_address || recipientAddress;
            recipientName = recipient.recipient_name || recipientName;
          }
        } else if (tx.recipient_details && typeof tx.recipient_details === 'object') {
          // Handle as a single object
          recipientAddress = (tx.recipient_details as any).stellar_address || recipientAddress;
          recipientName = (tx.recipient_details as any).recipient_name || recipientName;
        }
      }
      
      return {
        id: tx.id,
        hash: tx.stellar_tx_hash,
        created_at: tx.created_at,
        amount: tx.amount?.toString() || '0',
        asset_type: tx.from_asset === 'XLM' ? 'native' : tx.from_asset,
        successful: tx.status === 'completed',
        status: tx.status,
        transaction_type: transactionType,
        from_address: transactionType === 'received' ? recipientAddress : publicKey,
        to_address: transactionType === 'received' ? publicKey : recipientAddress,
        memo: tx.memo || '',
        recipient_name: recipientName || 'Unknown',
        recipient_id: tx.recipient_id,
        timeline: timeline
      };
    });
    
    return enhancedTransactions;
  } catch (error) {
    console.error('Error fetching enhanced transaction history:', error);
    toast.error('Could not load transaction history');
    hapticFeedback('error');
    return [];
  }
}

/**
 * Track a transaction through its lifecycle
 * @param {string} txHash - Transaction hash
 * @returns {Promise<{status: string, details: any}>} - Current transaction status
 */
export async function trackTransaction(txHash: string): Promise<{status: string, details: any}> {
  try {
    const tx = await server.transactions().transaction(txHash).call();
    
    if (!tx) {
      return { status: 'pending', details: null };
    }
    
    // Check if transaction is in the ledger
    return { 
      status: tx.successful ? 'completed' : 'failed', 
      details: tx 
    };
  } catch (error: any) {
    // If we get a 404, the transaction is still pending
    if (error.response && error.response.status === 404) {
      return { status: 'pending', details: null };
    }
    
    console.error('Error tracking transaction:', error);
    return { status: 'unknown', details: null };
  }
}

/**
 * Update transaction timeline in the database
 * @param {string} txId - Database transaction ID
 * @param {string} status - New status
 * @param {any} details - Additional details
 */
export async function updateTransactionTimeline(txId: string, status: string, details?: any): Promise<void> {
  try {
    // Update the transaction status directly
    await supabase
      .from('stellar_transactions')
      .update({ 
        status: status === 'completed' ? 'completed' : status === 'failed' ? 'failed' : 'pending',
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
      })
      .eq('id', txId);
      
  } catch (error) {
    console.error('Error updating transaction timeline:', error);
  }
}

/**
 * Create a record for a received transaction in the transaction history
 * This simulates the other side of a transaction for demo purposes
 */
export async function recordReceivedTransaction(
  fromAddress: string,
  toAddress: string,
  amount: string,
  hash: string,
  memo?: string
): Promise<void> {
  try {
    // Get the user ID for the record
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const now = new Date().toISOString();
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum)) {
      throw new Error('Invalid amount format');
    }
      // Create a record for the received transaction
    const { data, error } = await supabase
      .from('stellar_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'received',
        from_address: fromAddress,
        to_address: toAddress,
        from_asset: 'XLM',
        to_asset: 'XLM',
        amount: amountNum,
        fee: 0.00001,
        recipient_address: fromAddress,
        stellar_tx_hash: hash,
        memo: memo || '',
        status: 'completed',
        created_at: now,
        completed_at: now
      });
      
    if (error) {
      console.error('Error recording received transaction:', error);
    } else {
      console.log('Successfully recorded received transaction');
    }
  } catch (error) {
    console.error('Error recording received transaction:', error);
  }
}
