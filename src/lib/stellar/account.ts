
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

    if (error) throw error;    // Fund the account on testnet
    try {
      toast.loading('Setting up your account...');
      
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${publicKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Funding failed with status ${response.status}`);
      }
      
      const responseBody = await response.json();
      console.log('Account funded on testnet:', responseBody);
      
      // Record the funding transaction
      if (responseBody && responseBody.hash) {
        const timestamp = new Date().toISOString();
        
        await supabase.from('stellar_transactions').insert({
          user_id: user.id,
          stellar_tx_hash: responseBody.hash,
          transaction_type: 'funding',  // consistent naming with other parts of the app
          from_asset: 'XLM',
          to_asset: 'XLM',
          amount: 10000, // Friendbot usually gives 10,000 XLM on testnet
          fee: 0,
          status: 'completed',
          created_at: timestamp,
          completed_at: timestamp,
          recipient_address: publicKey,
          recipient_name: 'My Account'
        });
      }
      
      toast.dismiss();
      toast.success('Your account is ready with test funds!');
      hapticFeedback('success');
    } catch (err) {
      console.error('Error funding testnet account:', err);
      toast.dismiss();
      toast.error('Account created but funding failed. You can try adding funds later.');
      hapticFeedback('error');
    }

    return {
      id: data.id,
      publicKey: data.public_key,
      encryptedSecret: data.encrypted_secret,
    };
  } catch (error) {
    console.error('Error creating Stellar account:', error);
    toast.error('Failed to create Stellar account');
    return null;
  }
}

export async function getAccount(): Promise<StellarAccount | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('stellar_accounts')
      .select()
      .eq('user_id', user.id)
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
