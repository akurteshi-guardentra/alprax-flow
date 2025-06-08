// User Profile Service to simplify finding recipients by email/phone
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { FavoriteRecipient } from '@/types/favoriteRecipient';
import { StellarAccount } from '@/lib/stellar/types';
import { createStellarAccountForUser } from '@/lib/stellar/enhanced-account';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  stellar_account?: StellarAccount;
}

export interface FindUserOptions {
  includeStarredOnly?: boolean;
  includeCurrentUser?: boolean;
}

/**
 * Service to find users by various identifiers and manage user profiles
 */
export class UserProfileService {
  /**
   * Find a user by their email, phone number, or name
   */
  static async findUserByIdentifier(
    identifier: string,
    options: FindUserOptions = {}
  ): Promise<UserProfile[]> {
    if (!identifier || identifier.trim() === '') {
      return [];
    }

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      toast.error('You must be logged in to search for users');
      return [];
    }

    const searchTerm = identifier.toLowerCase().trim();
    
    try {
      // First, try to find in profiles table
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) {
        console.error('Error searching profiles:', error);
        throw error;
      }

      if (!profiles?.length) {
        return [];
      }

      // Filter out current user if not included
      const filteredProfiles = options.includeCurrentUser 
        ? profiles 
        : profiles.filter(p => p.id !== currentUser.id);

      // Load associated stellar accounts
      const userIds = filteredProfiles.map(p => p.id);
      const { data: stellarAccounts } = await supabase
        .from('stellar_accounts')
        .select('*')
        .in('user_id', userIds);

      // Map profiles to UserProfile format with associated stellar account
      const users: UserProfile[] = filteredProfiles.map(profile => {
        const stellarAccount = stellarAccounts?.find(acc => acc.user_id === profile.id);
        
        return {
          id: profile.id,
          full_name: profile.full_name || 'Unnamed User',
          email: profile.email || '',
          phone_number: profile.phone_number,
          avatar_url: profile.avatar_url,
          stellar_account: stellarAccount ? {
            id: stellarAccount.id,
            publicKey: stellarAccount.public_key,
            encryptedSecret: stellarAccount.encrypted_secret
          } : undefined
        };
      });

      return users;
    } catch (error) {
      console.error('Error searching for users:', error);
      toast.error('Failed to search for users');
      return [];
    }
  }

  /**
   * Get a user's Stellar account or create one if it doesn't exist
   */
  static async getOrCreateStellarAccount(userId: string): Promise<StellarAccount> {
    try {
      // First check if user already has a Stellar account
      const { data: existingAccount } = await supabase
        .from('stellar_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existingAccount) {
        return {
          id: existingAccount.id,
          publicKey: existingAccount.public_key,
          encryptedSecret: existingAccount.encrypted_secret
        };
      }
      
      // If not, create a new account
      return await createStellarAccountForUser(userId);
    } catch (error) {
      console.error('Error getting or creating Stellar account:', error);
      throw new Error('Unable to get or create Stellar account');
    }
  }

  /**
   * Add a recipient to favorites
   */
  static async addToFavorites(userProfile: UserProfile): Promise<FavoriteRecipient> {
    if (!userProfile.stellar_account?.publicKey) {
      throw new Error('User does not have a Stellar account');
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to add favorites');
    }

    try {
      // Check if already in favorites
      const { data: existing } = await supabase
        .from('favorite_recipients')
        .select('*')
        .eq('user_id', user.id)
        .eq('stellar_address', userProfile.stellar_account.publicKey)
        .maybeSingle();
        
      if (existing) {
        return existing as FavoriteRecipient;
      }
      
      // Add to favorites
      const { data, error } = await supabase
        .from('favorite_recipients')
        .insert([{
          user_id: user.id,
          recipient_name: userProfile.full_name,
          stellar_address: userProfile.stellar_account.publicKey,
          country: '', // Could be enhanced to get country from profile
          currency: 'USD', // Default currency
          relationship: 'Contact'
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      return data as FavoriteRecipient;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error('Failed to add recipient to favorites');
    }
  }
}
