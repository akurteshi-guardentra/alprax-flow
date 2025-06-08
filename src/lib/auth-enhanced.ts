// Enhanced User Authentication Flow
import { supabase } from '@/integrations/supabase/client';
import { StellarAccount } from '@/lib/stellar/types';
import { Keypair } from 'stellar-sdk';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';

/**
 * Simplified user onboarding that creates authentication, Stellar account, and funds in one flow
 */
export async function completeUserOnboarding(email: string, password: string) {
  try {
    toast.loading("Setting up your account...");
    
    // Step 1: Create the user account (authentication)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw new Error(`Authentication failed: ${authError.message}`);
    if (!authData.user) throw new Error("User creation failed");
    
    // Step 2: Create a Stellar account automatically
    const stellarAccount = await createStellarAccount(authData.user.id);
    
    // Step 3: Fund the account with test XLM
    await fundStellarAccount(stellarAccount.publicKey);
    
    toast.dismiss();
    toast.success("Your account is ready with test funds!");
    hapticFeedback("success");
    
    return { 
      user: authData.user,
      stellarAccount
    };
  } catch (error) {
    toast.dismiss();
    toast.error(error instanceof Error ? error.message : "Account setup failed");
    hapticFeedback("error");
    throw error;
  }
}

/**
 * Create a Stellar account for the user
 */
async function createStellarAccount(userId: string): Promise<StellarAccount> {
  // Generate a new Stellar keypair
  const keypair = Keypair.random();
  const publicKey = keypair.publicKey();
  const secretKey = keypair.secret();
  
  // Simple encryption (should be more secure in production)
  const encryptedSecret = btoa(secretKey);

  // Store in database
  const { data, error } = await supabase
    .from('stellar_accounts')
    .insert({
      user_id: userId,
      public_key: publicKey,
      encrypted_secret: encryptedSecret,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to store Stellar account: ${error.message}`);

  return {
    id: data.id,
    publicKey: data.public_key,
    encryptedSecret: data.encrypted_secret,
  };
}

/**
 * Fund a Stellar account with test XLM
 */
async function fundStellarAccount(publicKey: string): Promise<void> {
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${publicKey}`
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Funding failed: ${errorText}`);
  }
  
  const responseData = await response.json();
  
  // Record the funding transaction
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const timestamp = new Date().toISOString();
    
    await supabase.from('stellar_transactions').insert({
      user_id: user.id,
      stellar_tx_hash: responseData.hash,
      transaction_type: 'funding',
      from_asset: 'XLM',
      to_asset: 'XLM',
      amount: 10000,
      fee: 0,
      status: 'completed',
      created_at: timestamp,
      completed_at: timestamp,
      memo: 'Initial account funding',
      recipient_address: publicKey,
      recipient_name: 'My Account'
    });
  }
}

/**
 * Reset user password (forgot password flow)
 */
export async function resetPassword(email: string): Promise<boolean> {
  try {
    toast.loading("Sending password reset email...");
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    
    if (error) throw error;
    
    toast.dismiss();
    toast.success("Password reset link sent to your email");
    return true;
  } catch (error) {
    toast.dismiss();
    toast.error("Failed to send reset link. Please try again.");
    console.error("Password reset error:", error);
    return false;
  }
}

/**
 * Complete password reset with new password
 */
export async function completePasswordReset(newPassword: string): Promise<boolean> {
  try {
    toast.loading("Updating your password...");
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    toast.dismiss();
    toast.success("Password updated successfully");
    return true;
  } catch (error) {
    toast.dismiss();
    toast.error("Failed to update password. Please try again.");
    console.error("Password update error:", error);
    return false;
  }
}
