
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
      // Sanitize input: strip PostgREST filter-special characters and enforce a
      // safe length so raw user text cannot alter the .or() filter DSL.
      const cleaned = (identifier || '')
        .replace(/[,()"'*]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100);

      if (cleaned.length < 2) return [];

      // Escape PostgREST LIKE wildcards inside the value so users can't
      // craft patterns via % or _.
      const escaped = cleaned.replace(/[%_\\]/g, (m) => `\\${m}`);

      // Run per-field parameterized ilike queries and merge, instead of
      // building a raw .or() filter string from user input.
      const fields = ['full_name', 'username', 'phone_number'] as const;
      const results = await Promise.all(
        fields.map((field) =>
          supabase.from('profiles').select('*').ilike(field, `%${escaped}%`).limit(20)
        )
      );

      const merged = new Map<string, any>();
      for (const r of results) {
        if (r.error) {
          console.error('Error searching profiles:', r.error);
          continue;
        }
        for (const row of r.data || []) merged.set((row as any).id, row);
      }
      return Array.from(merged.values()) as UserProfile[];
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
