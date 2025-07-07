import { supabase } from '@/integrations/supabase/client';
import { PaymentErrorService } from './PaymentErrorService';

export interface QueuedTransaction {
  id: string;
  user_id: string;
  recipient_address: string;
  amount: number;
  memo?: string;
  metadata: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  attempts: number;
  max_attempts: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  stellar_tx_hash?: string;
}

export interface QueueTransactionParams {
  recipientAddress: string;
  amount: number;
  memo?: string;
  metadata?: Record<string, any>;
  priority?: number;
}

export class TransactionQueueService {
  static async queueTransaction(params: QueueTransactionParams): Promise<QueuedTransaction | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transaction_queue')
        .insert({
          user_id: user.id,
          recipient_address: params.recipientAddress,
          amount: params.amount,
          memo: params.memo,
          metadata: params.metadata || {},
          priority: params.priority || 0,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data as QueuedTransaction;
    } catch (error) {
      console.error('Failed to queue transaction:', error);
      await PaymentErrorService.logError({
        errorType: 'unknown',
        errorMessage: 'Failed to queue transaction',
        errorDetails: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return null;
    }
  }

  static async updateTransactionStatus(
    id: string, 
    status: QueuedTransaction['status'],
    updates?: Partial<QueuedTransaction>
  ): Promise<boolean> {
    try {
      const updateData: any = { 
        status,
        ...updates
      };

      if (status === 'processing' && !updates?.started_at) {
        updateData.started_at = new Date().toISOString();
      }

      if (status === 'completed' && !updates?.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('transaction_queue')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update transaction status:', error);
      return false;
    }
  }

  static async incrementAttempts(id: string): Promise<boolean> {
    try {
      const { data: transaction } = await supabase
        .from('transaction_queue')
        .select('attempts')
        .eq('id', id)
        .single();

      if (!transaction) return false;

      const { error } = await supabase
        .from('transaction_queue')
        .update({ 
          attempts: transaction.attempts + 1,
          status: transaction.attempts + 1 >= 3 ? 'failed' : 'pending'
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to increment attempts:', error);
      return false;
    }
  }

  static async getPendingTransactions(): Promise<QueuedTransaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transaction_queue')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as QueuedTransaction[];
    } catch (error) {
      console.error('Failed to fetch pending transactions:', error);
      return [];
    }
  }

  static async getUserTransactions(limit: number = 50): Promise<QueuedTransaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transaction_queue')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as QueuedTransaction[];
    } catch (error) {
      console.error('Failed to fetch user transactions:', error);
      return [];
    }
  }

  static async retryTransaction(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transaction_queue')
        .update({
          status: 'pending',
          error_message: null,
          started_at: null
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to retry transaction:', error);
      return false;
    }
  }
}