import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentError {
  id: string;
  user_id: string;
  transaction_id?: string;
  error_type: string;
  error_message: string;
  error_details: Record<string, any>;
  stellar_tx_hash?: string;
  retry_count: number;
  created_at: string;
  resolved_at?: string;
}

export interface LogPaymentErrorParams {
  transactionId?: string;
  errorType: 'validation' | 'network' | 'stellar' | 'balance' | 'unknown';
  errorMessage: string;
  errorDetails?: Record<string, any>;
  stellarTxHash?: string;
  retryCount?: number;
}

export class PaymentErrorService {
  static async logError(params: LogPaymentErrorParams): Promise<PaymentError | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payment_errors')
        .insert({
          user_id: user.id,
          transaction_id: params.transactionId,
          error_type: params.errorType,
          error_message: params.errorMessage,
          error_details: params.errorDetails || {},
          stellar_tx_hash: params.stellarTxHash,
          retry_count: params.retryCount || 0
        })
        .select()
        .single();

      if (error) throw error;
      return data as PaymentError;
    } catch (error) {
      console.error('Failed to log payment error:', error);
      return null;
    }
  }

  static async getUserErrors(limit: number = 50): Promise<PaymentError[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payment_errors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as PaymentError[];
    } catch (error) {
      console.error('Failed to fetch payment errors:', error);
      return [];
    }
  }

  static async markErrorResolved(errorId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_errors')
        .update({ resolved_at: new Date().toISOString() })
        .eq('id', errorId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to mark error as resolved:', error);
      return false;
    }
  }

  static getErrorMessage(errorType: string, originalMessage: string): string {
    const errorMessages: Record<string, string> = {
      'validation': 'Please check your transaction details and try again.',
      'network': 'Network error occurred. Please check your connection and try again.',
      'stellar': 'Stellar network error. Please try again in a moment.',
      'balance': 'Insufficient funds for this transaction.',
      'unknown': 'An unexpected error occurred. Please try again or contact support.'
    };

    return errorMessages[errorType] || originalMessage;
  }

  static showUserFriendlyError(errorType: string, originalMessage: string): void {
    const userMessage = this.getErrorMessage(errorType, originalMessage);
    toast.error(userMessage);
  }
}