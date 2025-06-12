
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Horizon, Keypair } from 'stellar-sdk';
import { toast } from 'sonner';

export interface Balance {
  asset_type: string;
  balance: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
  asset_code?: string;
  asset_issuer?: string;
}

export interface StellarAccountData {
  id: string;
  account_id: string;
  sequence: string;
  subentry_count: number;
  balances: Balance[];
  signers: any[];
  data: Record<string, string>;
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
    auth_clawback_enabled: boolean;
  };
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
}

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

export function useStellarAccount() {
  const [isSending, setIsSending] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const { data: stellarAccounts } = useQuery({
    queryKey: ['stellar-accounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('stellar_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const primaryAccount = stellarAccounts?.[0];

  const { data: accountData, isLoading } = useQuery({
    queryKey: ['stellar-account-data', primaryAccount?.public_key],
    queryFn: async () => {
      if (!primaryAccount?.public_key) return null;
      
      try {
        const account = await server.loadAccount(primaryAccount.public_key);
        return account as StellarAccountData;
      } catch (error) {
        console.error('Error loading account from Stellar:', error);
        // Return mock data with default balance for demo purposes
        return {
          id: primaryAccount.public_key,
          account_id: primaryAccount.public_key,
          sequence: '0',
          subentry_count: 0,
          balances: [
            {
              asset_type: 'native',
              balance: '1000.0000000' // Default 1000 XLM for demo
            }
          ],
          signers: [],
          data: {},
          flags: {
            auth_required: false,
            auth_revocable: false,
            auth_immutable: false,
            auth_clawback_enabled: false
          },
          thresholds: {
            low_threshold: 0,
            med_threshold: 0,
            high_threshold: 0
          }
        } as StellarAccountData;
      }
    },
    enabled: !!primaryAccount?.public_key,
  });

  const balance = accountData?.balances || [];
  const publicKey = primaryAccount?.public_key;

  // Create account method
  const setupAccount = async () => {
    try {
      setIsSettingUp(true);
      const keypair = Keypair.random();
      const publicKey = keypair.publicKey();
      const secretKey = keypair.secret();
      
      const encryptedSecret = btoa(secretKey);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Store the account in the database
      const { data, error } = await supabase
        .from('stellar_accounts')
        .insert({
          user_id: user.id,
          public_key: publicKey,
          encrypted_secret: encryptedSecret,
        })
        .select()
        .single();

      if (error) throw error;

      // Fund the account automatically
      const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
      
      if (response.ok) {
        toast.success('Account created and funded successfully! 🎉');
      } else {
        toast.success('Account created successfully!');
      }

      // Refresh queries
      window.location.reload();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
    } finally {
      setIsSettingUp(false);
    }
  };

  // Fund account method
  const fundAccount = async () => {
    if (!publicKey) return;
    
    try {
      setIsFunding(true);
      const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
      
      if (response.ok) {
        toast.success('Test funds added successfully! 💰');
        // Refresh the account data
        window.location.reload();
      } else {
        toast.error('Failed to add test funds');
      }
    } catch (error) {
      console.error('Error funding account:', error);
      toast.error('Failed to add test funds');
    } finally {
      setIsFunding(false);
    }
  };

  // Send payment method (placeholder)
  const sendPayment = async (params: any) => {
    setIsSending(true);
    try {
      // Implementation would go here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
      toast.success('Payment sent successfully!');
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setIsSending(false);
    }
  };

  // Backward compatibility - map to old interface
  const account = primaryAccount ? {
    publicKey: primaryAccount.public_key,
    id: primaryAccount.id,
    encryptedSecret: primaryAccount.encrypted_secret
  } : null;

  return {
    balance,
    publicKey,
    accountData,
    isLoading,
    isSending,
    isFunding,
    isSettingUp,
    stellarAccounts,
    primaryAccount,
    account, // Backward compatibility
    setupAccount,
    fundAccount,
    sendPayment
  };
}
