import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EnhancedPaymentService, EnhancedPaymentParams } from '@/services/EnhancedPaymentService';
import { PaymentErrorService, PaymentError } from '@/services/PaymentErrorService';
import { TransactionQueueService, QueuedTransaction } from '@/services/TransactionQueueService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useEnhancedPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<PaymentError[]>([]);
  const [queuedTransactions, setQueuedTransactions] = useState<QueuedTransaction[]>([]);
  const queryClient = useQueryClient();

  // Load user errors and queued transactions
  useEffect(() => {
    loadUserData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

    // Subscribe to payment errors
    const errorsChannel = supabase
      .channel('payment-errors')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payment_errors',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newError = payload.new as PaymentError;
          setErrors(prev => [newError, ...prev]);
          
          // Show toast for new errors
          if (newError.error_type !== 'validation') {
            toast.error(`Payment error: ${newError.error_message}`);
          }
        }
      )
      .subscribe();

    // Subscribe to transaction queue updates
    const queueChannel = supabase
      .channel('transaction-queue')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaction_queue',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTransaction = payload.new as QueuedTransaction;
            setQueuedTransactions(prev => [newTransaction, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedTransaction = payload.new as QueuedTransaction;
            setQueuedTransactions(prev => 
              prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
            );
            
            // Show status updates
            if (updatedTransaction.status === 'completed') {
              toast.success(`Payment completed: ${updatedTransaction.amount} XLM`);
            } else if (updatedTransaction.status === 'failed') {
              toast.error(`Payment failed: ${updatedTransaction.error_message || 'Unknown error'}`);
            }
          }
        }
      )
      .subscribe();

      return () => {
        supabase.removeChannel(errorsChannel);
        supabase.removeChannel(queueChannel);
      };
    };
    
    setupSubscriptions();
  }, []);

  const loadUserData = async () => {
    try {
      const [userErrors, userTransactions] = await Promise.all([
        PaymentErrorService.getUserErrors(20),
        TransactionQueueService.getUserTransactions(20)
      ]);
      
      setErrors(userErrors);
      setQueuedTransactions(userTransactions);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const executePayment = async (params: EnhancedPaymentParams) => {
    setIsProcessing(true);
    try {
      const result = await EnhancedPaymentService.executePayment(params);
      
      // Refresh data after payment
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['stellar-balance'] });
        queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
        await loadUserData();
      }
      
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  const validatePayment = async (params: EnhancedPaymentParams) => {
    return await EnhancedPaymentService.validatePayment(params);
  };

  const retryTransaction = async (transactionId: string) => {
    setIsProcessing(true);
    try {
      const result = await EnhancedPaymentService.retryFailedTransaction(transactionId);
      
      if (result.success) {
        await loadUserData();
        queryClient.invalidateQueries({ queryKey: ['stellar-balance'] });
      }
      
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  const markErrorResolved = async (errorId: string) => {
    const success = await PaymentErrorService.markErrorResolved(errorId);
    if (success) {
      setErrors(prev => 
        prev.map(error => 
          error.id === errorId 
            ? { ...error, resolved_at: new Date().toISOString() }
            : error
        )
      );
    }
    return success;
  };

  const processQueue = async () => {
    setIsProcessing(true);
    try {
      await EnhancedPaymentService.processQueuedTransactions();
      await loadUserData();
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter functions for UI
  const pendingTransactions = queuedTransactions.filter(t => 
    t.status === 'pending' || t.status === 'processing'
  );
  
  const failedTransactions = queuedTransactions.filter(t => 
    t.status === 'failed' && t.attempts < t.max_attempts
  );
  
  const unresolvedErrors = errors.filter(e => !e.resolved_at);

  return {
    // State
    isProcessing,
    errors,
    queuedTransactions,
    pendingTransactions,
    failedTransactions,
    unresolvedErrors,
    
    // Actions
    executePayment,
    validatePayment,
    retryTransaction,
    markErrorResolved,
    processQueue,
    loadUserData
  };
}