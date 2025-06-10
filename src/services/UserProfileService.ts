import { supabase } from '@/lib/supabase';

export class UserProfileService {
  static async getProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  static async updateProfile(userId: string, updates: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  static async getOrCreateStellarAccount(userId: string): Promise<any> {
    try {
      const { data: existingAccount, error: selectError } = await supabase
        .from('stellar_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (selectError && selectError.message.includes('No rows found')) {
        // Account doesn't exist, create it
        const { data: newAccount, error: insertError } = await supabase.functions.invoke('create-stellar-account', {
          body: { user_id: userId },
        });

        if (insertError) throw insertError;
        return newAccount;
      }

      if (selectError) throw selectError;

      return existingAccount;
    } catch (error) {
      console.error('Error getting or creating Stellar account:', error);
      throw error;
    }
  }

  static async findUserByIdentifier(identifier: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${identifier}%,username.ilike.%${identifier}%,phone_number.ilike.%${identifier}%`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error finding user by identifier:', error);
      throw error;
    }
  }
}
