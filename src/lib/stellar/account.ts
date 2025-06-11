
import { Keypair } from 'stellar-sdk';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';
import { StellarAccount } from './types';
import { server } from './config';

export async function createAccount(): Promise<StellarAccount | null> {
  try {
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();
    
    // TODO: Implement proper encryption of the secret key
    // For now, we'll store it encrypted with a simple encoding
    // This should be replaced with proper encryption in production
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

    // Automatically fund the account on testnet with generous amount
    try {
      toast.loading('Setting up your account with funds...');
      
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${publicKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Funding failed with status ${response.status}`);
      }
      
      const responseBody = await response.json();
      console.log('Account funded on testnet:', responseBody);
      
      // Record the funding transaction with a larger amount
      if (responseBody && responseBody.hash) {
        const timestamp = new Date().toISOString();
        
        await supabase.from('stellar_transactions').insert({
          user_id: user.id,
          stellar_tx_hash: responseBody.hash,
          transaction_type: 'funding',
          from_asset: 'XLM',
          to_asset: 'XLM',
          amount: 10000, // Friendbot gives 10,000 XLM on testnet
          fee: 0,
          status: 'completed',
          created_at: timestamp,
          completed_at: timestamp,
          memo: 'Welcome to Alprax! Your account is ready.',
          recipient_name: 'My Account'
        });
      }
      
      toast.dismiss();
      toast.success('Your account is ready with funds! 🎉');
      hapticFeedback('success');
    } catch (err) {
      console.error('Error funding testnet account:', err);
      toast.dismiss();
      toast.error('Account created but funding failed. You can add funds later.');
      hapticFeedback('error');
    }

    return {
      id: data.id,
      publicKey: data.public_key,
      encryptedSecret: data.encrypted_secret,
    };
  } catch (error) {
    console.error('Error creating Stellar account:', error);
    toast.error('Failed to create your account');
    return null;
  }
}

export async function getAccount(): Promise<StellarAccount | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Use maybeSingle to handle cases where no data exists
    const { data, error } = await supabase
      .from('stellar_accounts')
      .select()
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return {
      id: data.id,
      publicKey: data.public_key,
      encryptedSecret: data.encrypted_secret,
    };
  } catch (error) {
    console.error('Error getting Stellar account:', error);
    return null;
  }
}

// New function to add more test funds to existing accounts
export async function addTestFunds(publicKey: string): Promise<boolean> {
  try {
    toast.loading('Adding test funds to your account...');
    
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${publicKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Funding failed with status ${response.status}`);
    }
    
    const responseBody = await response.json();
    console.log('Additional funds added:', responseBody);
    
    // Record the additional funding transaction
    if (responseBody && responseBody.hash) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const timestamp = new Date().toISOString();
        
        await supabase.from('stellar_transactions').insert({
          user_id: user.id,
          stellar_tx_hash: responseBody.hash,
          transaction_type: 'funding',
          from_asset: 'XLM',
          to_asset: 'XLM',
          amount: 10000,
          fee: 0,
          status: 'completed',
          created_at: timestamp,
          completed_at: timestamp,
          memo: 'Additional test funds added',
          recipient_name: 'My Account'
        });
      }
    }
    
    toast.dismiss();
    toast.success('Test funds added successfully! 💰');
    hapticFeedback('success');
    return true;
  } catch (error) {
    console.error('Error adding test funds:', error);
    toast.dismiss();
    toast.error('Failed to add test funds. Please try again.');
    hapticFeedback('error');
    return false;
  }
}
