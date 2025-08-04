
import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { stellar } from '@/lib/stellar';
import { hapticFeedback } from '@/lib/haptics';
import { TestAccount } from '@/lib/stellar/types';
import { supabase } from '@/integrations/supabase/client';
import { Protocol23Handler } from '@/lib/stellar/protocol23';

const LOCAL_STORAGE_KEY = 'stellar_test_accounts';

export function useTestAccounts() {
  const queryClient = useQueryClient();
  const [accounts, setAccounts] = useState<TestAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<TestAccount | null>(null);
  
  // Load accounts from local storage on mount
  useEffect(() => {
    const loadAccounts = () => {
      try {
        const savedAccounts = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedAccounts) {
          const parsedAccounts = JSON.parse(savedAccounts) as TestAccount[];
          setAccounts(parsedAccounts);
          
          // Set active account if available
          const active = parsedAccounts.find(a => a.isActive);
          if (active) {
            setActiveAccount(active);
          } else if (parsedAccounts.length > 0) {
            // Set first account as active if none marked
            const updatedAccounts = parsedAccounts.map((account, index) => ({
              ...account,
              isActive: index === 0
            }));
            setAccounts(updatedAccounts);
            setActiveAccount(updatedAccounts[0]);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAccounts));
          }
        }
      } catch (error) {
        console.error('Error loading test accounts:', error);
        toast.error('Could not load test accounts');
      }
    };
    
    loadAccounts();
  }, []);
  
  // Save accounts to localStorage whenever they change
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(accounts));
    }
  }, [accounts]);
  
  // Create a new test account
  const createAccountMutation = useMutation({
    mutationFn: async (name: string): Promise<TestAccount> => {
      const result = await stellar.createAccount();
      if (!result) throw new Error('Failed to create account');
      
      const newAccount: TestAccount = {
        id: result.id,
        name: name || `Test Account ${accounts.length + 1}`,
        publicKey: result.publicKey,
        encryptedSecret: result.encryptedSecret,
        balance: '10000', // Initial balance from friendbot
        isActive: accounts.length === 0, // Set as active if it's the first account
        createdAt: new Date().toISOString()
      };
      
      return newAccount;
    },
    onSuccess: (newAccount) => {
      // If this is the first account, set it as active
      const updatedAccounts = accounts.map(account => ({
        ...account,
        isActive: newAccount.isActive ? false : account.isActive
      }));
      
      const newAccounts = [...updatedAccounts, newAccount];
      setAccounts(newAccounts);
      
      if (newAccount.isActive) {
        setActiveAccount(newAccount);
        // Update the account in Supabase as well
        refreshAccount(newAccount.publicKey);
      }
      
      queryClient.invalidateQueries({ queryKey: ['stellar-account'] });
      hapticFeedback('success');
      toast.success(`Test account "${newAccount.name}" created`);
    },
    onError: (error) => {
      console.error('Error creating test account:', error);
      toast.error('Failed to create test account');
      hapticFeedback('error');
    }
  });
  
  // Switch to a different test account
  const switchAccount = (id: string) => {
    const updatedAccounts = accounts.map(account => ({
      ...account,
      isActive: account.id === id
    }));
    
    const newActiveAccount = updatedAccounts.find(account => account.id === id) || null;
    
    setAccounts(updatedAccounts);
    setActiveAccount(newActiveAccount);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAccounts));
    
    if (newActiveAccount) {
      refreshAccount(newActiveAccount.publicKey);
      toast.success(`Switched to ${newActiveAccount.name}`);
      hapticFeedback('medium');
    }
    
    // Refresh queries
    queryClient.invalidateQueries({ queryKey: ['stellar-account'] });
    queryClient.invalidateQueries({ queryKey: ['stellar-balance'] });
    queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
  };
    // Fund a test account
  const fundAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const account = accounts.find(a => a.id === id);
      if (!account) throw new Error('Account not found');
      
      console.log(`Funding test account: ${account.name} (${account.publicKey})`);
      const result = await stellar.fundTestAccount(account.publicKey);
      if (!result.success) throw new Error(result.error || 'Funding failed');
      
      // Get the latest balance directly from the network
      const balances = await stellar.getBalance(account.publicKey);
      const newBalance = balances.length > 0 ? balances[0].balance : '10000'; // Default to 10000 if can't fetch
      
      console.log(`New balance after funding: ${newBalance} XLM`);
      
      return { 
        id, 
        hash: result.hash,
        balance: newBalance 
      };
    },
    onSuccess: async (data) => {
      const { id, balance } = data;
      
      // Update the account with the new balance
      setAccounts(prevAccounts => prevAccounts.map(account => 
        account.id === id ? { ...account, balance } : account
      ));
      
      // Update active account if this is the one that was funded
      if (activeAccount?.id === id) {
        setActiveAccount(prev => prev ? { ...prev, balance } : null);
      }
      
      // Also refresh to make sure we have the latest data
      await refreshBalanceMutation.mutateAsync(id);
      
      // Update other queries that might need refreshing
      queryClient.invalidateQueries({ queryKey: ['stellar-balance'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
      
      toast.success(`Test account funded successfully`);
      hapticFeedback('success');
    },
    onError: (error) => {
      console.error('Error funding test account:', error);
      toast.error('Failed to fund test account');
      hapticFeedback('error');
    }
  });
  
  // Refresh account balance
  const refreshBalanceMutation = useMutation({
    mutationFn: async (id: string) => {
      const account = accounts.find(a => a.id === id);
      if (!account) throw new Error('Account not found');
      
      const balances = await stellar.getBalance(account.publicKey);
      const newBalance = balances.length > 0 ? balances[0].balance : '0';
      
      return { id, balance: newBalance };
    },
    onSuccess: (data) => {
      const { id, balance } = data;
      
      setAccounts(prevAccounts => prevAccounts.map(account => 
        account.id === id ? { ...account, balance } : account
      ));
      
      // Update active account if needed
      if (activeAccount?.id === id) {
        setActiveAccount(prev => prev ? { ...prev, balance } : null);
      }
      
      queryClient.invalidateQueries({ queryKey: ['stellar-balance'] });
    },
    onError: (error) => {
      console.error('Error refreshing balance:', error);
      toast.error('Failed to refresh balance');
    }
  });
  
  // Update the active account in Supabase
  const refreshAccount = async (publicKey: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Check if there's an account
      const { data: existingAccount } = await supabase
        .from('stellar_accounts')
        .select()
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();
        
      if (existingAccount) {
        // Update existing account
        await supabase
          .from('stellar_accounts')
          .update({
            public_key: publicKey,
            encrypted_secret: accounts.find(a => a.publicKey === publicKey)?.encryptedSecret || '',
            last_sync_at: new Date().toISOString()
          })
          .eq('id', existingAccount.id);
      }
      
      queryClient.invalidateQueries({ queryKey: ['stellar-account'] });
    } catch (error) {
      console.error('Error refreshing account in database:', error);
    }
  };
  
  return {
    accounts,
    activeAccount,
    createAccount: createAccountMutation.mutate,
    switchAccount,
    fundAccount: fundAccountMutation.mutate,
    refreshBalance: refreshBalanceMutation.mutate,
    isLoading: createAccountMutation.isPending || fundAccountMutation.isPending || refreshBalanceMutation.isPending
  };
}
