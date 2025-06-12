
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FavoriteRecipient } from '@/types/favoriteRecipient';

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  country?: string;
}

export class UserProfileService {
  static async findUserByIdentifier(identifier: string): Promise<UserProfile[]> {
    try {
      console.log('Searching for users with identifier:', identifier);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${identifier}%,username.ilike.%${identifier}%,phone_number.ilike.%${identifier}%`);

      if (error) {
        console.error('Error searching profiles:', error);
        throw error;
      }

      console.log('Search results:', data);
      return data || [];
    } catch (error) {
      console.error('Error in findUserByIdentifier:', error);
      throw error;
    }
  }

  static async addToFavorites(userProfile: UserProfile): Promise<FavoriteRecipient> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if recipient already exists
      const { data: existing } = await supabase
        .from('favorite_recipients')
        .select('*')
        .eq('user_id', user.id)
        .eq('stellar_address', userProfile.id)
        .single();

      if (existing) {
        // Return existing recipient instead of throwing error
        console.log('Recipient already exists, returning existing:', existing);
        return existing;
      }

      const favoriteData = {
        user_id: user.id,
        recipient_name: userProfile.full_name,
        stellar_address: userProfile.id,
        country: userProfile.country || 'US',
        currency: userProfile.country === 'at' ? 'EUR' : 'USD',
        relationship: 'Contact'
      };

      console.log('Adding new favorite recipient:', favoriteData);

      const { data, error } = await supabase
        .from('favorite_recipients')
        .insert(favoriteData)
        .select()
        .single();

      if (error) {
        console.error('Error adding to favorites:', error);
        throw error;
      }

      console.log('Successfully added favorite recipient:', data);
      return data;
    } catch (error) {
      console.error('Error in addToFavorites:', error);
      throw error;
    }
  }

  static async getOrCreateStellarAccount(userId: string): Promise<{ publicKey: string }> {
    // For now, return the user ID as stellar address
    // In a real implementation, this would create/get a proper Stellar account
    return { publicKey: userId };
  }
}
