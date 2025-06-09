import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { stellar } from '@/lib/stellar';
import { StellarAccount } from '@/lib/stellar/types';
import { TransactionTimelineEvent } from '@/services/stellar/types';

export function useStellarAccount() {
  const queryClient = useQueryClient();
  
  // Only get the user's real Stellar account
  const getAccountFn = async () => {
    return stellar.getAccount();
  };

  const { data: account, isLoading } = useQuery({
    queryKey: ['stellar-account'],
    queryFn: getAccountFn,
  });

  const { data: balance = [], isLoading: isLoadingBalance } = useQuery({
    queryKey: ['stellar-balance', account?.publicKey],
    queryFn: () => account?.publicKey ? stellar.getBalance(account.publicKey) : Promise.resolve([]),
    enabled: !!account?.publicKey,
  });

  const setupAccount = useMutation({
    mutationFn: stellar.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stellar-account'] });
      toast.success('Payment account set up successfully');
    },
    onError: (error) => {
      toast.error('Failed to set up payment account');
      console.error('Create account error:', error);
    },
  });  const fundAccount = useMutation({
    mutationFn: async () => {
      if (!account?.publicKey) {
        throw new Error('Account not set up yet');
      }
      return stellar.fundTestAccount(account.publicKey);
    },
    onSuccess: () => {
      // Force refetch balance data to ensure UI is updated
      queryClient.invalidateQueries({ 
        queryKey: ['stellar-balance'],
        refetchType: 'all'  // Force refetch from network
      });
      
      // Wait for balance update to complete before updating history
      setTimeout(() => {
        // Also update transaction history to show the funding
        queryClient.invalidateQueries({ 
          queryKey: ['transaction-history'],
          refetchType: 'all'
        });
      }, 1000);
      
      toast.success('Test funds added to your account');
    },
    onError: (error) => {
      toast.error('Failed to add test funds');
      console.error('Funding error:', error);
    },
  });
  const sendPayment = useMutation({
    mutationFn: async ({ 
      destination, 
      amount, 
      memo, 
      recipientName, 
      recipientId 
    }: { 
      destination: string; 
      amount: string; 
      memo?: string;
      recipientName?: string;
      recipientId?: string;
    }) => {
      if (!account) {
        throw new Error('Account not set up yet');
      }
      
      // Get the secret key (in a real app, this would involve decryption)
      const secretKey = atob(account.encryptedSecret);
      
      // Validate the inputs before sending
      if (!destination || destination.trim() === '') {
        throw new Error('Recipient address cannot be empty');
      }
      
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      
      // Check for available balance
      if (balance && balance.length > 0) {
        const availableBalance = parseFloat(balance[0].balance);
        if (parseFloat(amount) > availableBalance) {
          throw new Error('Insufficient funds. Try adding test funds first.');
        }
      }
      
      // Send the payment using the Stellar service
      return stellar.sendPayment(destination, amount, 'XLM', recipientName, recipientId);
    },    onSuccess: () => {
      // Invalidate all potentially affected queries
      console.log("Payment successful, invalidating queries...");
      
      // Refresh account balance with higher priority
      queryClient.invalidateQueries({ 
        queryKey: ['stellar-balance'],
        refetchType: 'all'  // Force refetch from network
      });
      
      // Short timeout to ensure balance refresh completes
      setTimeout(() => {
        // Refresh transaction history
        queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
        
        // Also refresh transactions table
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        
        // Update analytics if they exist
        queryClient.invalidateQueries({ queryKey: ['transaction-analytics'] });
      }, 500);
    },
    onError: (error) => {      let errorMessage = 'Your payment could not be completed. Please try again or contact support.';
      
      if (error instanceof Error) {
        if (!error.message.includes("Stellar") && !error.message.includes("XLM") && !error.message.includes("blockchain")) {
          errorMessage = "Payment failed: " + error.message;
        }
      }
      
      toast.error(errorMessage);
      console.error('Payment error:', error);
    },
  });

  return {
    account,
    balance,
    isLoading: isLoading || isLoadingBalance,
    setupAccount: setupAccount.mutate,
    isSettingUp: setupAccount.isPending,
    fundAccount: fundAccount.mutate,
    isFunding: fundAccount.isPending,
    sendPayment: sendPayment.mutate,
    isSending: sendPayment.isPending,
  };
}
