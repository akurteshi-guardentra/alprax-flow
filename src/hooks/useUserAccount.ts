/**
 * User Account Hook - Abstracted from Stellar
 * Provides user-friendly account information without blockchain details
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AbstractAccountService, UserAccount } from '@/services/account/AbstractAccountService';
import { toast } from 'sonner';

export function useUserAccount() {
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const { data: account, isLoading: queryLoading } = useQuery({
    queryKey: ['user-account'],
    queryFn: async () => {
      const account = await AbstractAccountService.getAccount();
      return account;
    },
    refetchInterval: 30000, // Refresh balance every 30 seconds
  });

  useEffect(() => {
    setIsLoading(queryLoading);
  }, [queryLoading]);

  const refreshAccount = async () => {
    await queryClient.invalidateQueries({ queryKey: ['user-account'] });
  };

  const updateCurrency = async (currency: 'USD' | 'EUR' | 'GBP') => {
    if (!account) return false;
    
    try {
      const { data: { user } } = await (await import('@/integrations/supabase/client')).supabase.auth.getUser();
      if (!user) return false;
      
      const success = await AbstractAccountService.updatePreferredCurrency(user.id, currency);
      if (success) {
        await refreshAccount();
        toast.success(`Currency updated to ${currency}`);
      }
      return success;
    } catch (error) {
      console.error('Error updating currency:', error);
      toast.error('Failed to update currency');
      return false;
    }
  };

  return {
    account,
    balance: account?.balance || 0,
    currency: account?.currency || 'USD',
    accountId: account?.accountId,
    isLoading,
    refreshAccount,
    updateCurrency
  };
}
