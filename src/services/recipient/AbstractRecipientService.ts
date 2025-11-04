/**
 * User-Facing Recipient Service
 * Manages recipients without exposing Stellar addresses
 */

import { supabase } from '@/integrations/supabase/client';

export interface UserRecipient {
  id: string;
  name: string;
  identifier: string; // Email or phone
  identifierType: 'email' | 'phone';
  country: string;
  createdAt: string;
}

export class AbstractRecipientService {
  /**
   * Add recipient by email or phone
   * Stellar address lookup happens silently
   */
  static async addRecipient(
    identifier: string,
    name: string,
    country: string
  ): Promise<UserRecipient | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Determine identifier type
      const identifierType = identifier.includes('@') ? 'email' : 'phone';
      
      // 1. Find user by email/phone
      let stellarAddress: string | null = null;
      
      if (identifierType === 'email') {
        const { data: foundUser } = await supabase.rpc('find_user_by_email', {
          search_email: identifier
        });
        
        if (foundUser && foundUser.length > 0) {
          const userId = foundUser[0].user_id;
          
          // Get their Stellar address (hidden)
          const { data: account } = await supabase
            .from('stellar_accounts')
            .select('public_key')
            .eq('user_id', userId)
            .order('is_primary', { ascending: false })
            .limit(1)
            .single();
          
          if (account) {
            stellarAddress = account.public_key;
          }
        }
      }
      
      if (!stellarAddress) {
        throw new Error('Recipient not found or has no account');
      }
      
      // 2. Store recipient with hidden Stellar address
      const { data: recipient, error } = await supabase
        .from('favorite_recipients')
        .insert({
          user_id: user.id,
          recipient_name: name,
          stellar_address: stellarAddress, // Hidden field
          country: country,
          currency: 'USD', // Required field
          recipient_identifier_type: identifierType,
          recipient_email: identifierType === 'email' ? identifier : null,
          recipient_phone: identifierType === 'phone' ? identifier : null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // 3. Return user-friendly data (no Stellar address)
      return {
        id: recipient.id,
        name: recipient.recipient_name,
        identifier: identifier,
        identifierType: identifierType,
        country: recipient.country,
        createdAt: recipient.created_at,
      };
    } catch (error) {
      console.error('Error adding recipient:', error);
      return null;
    }
  }
  
  /**
   * Get all recipients for user
   * Returns only user-friendly data
   */
  static async getRecipients(): Promise<UserRecipient[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data: recipients } = await supabase
        .from('favorite_recipients')
        .select('*')
        .eq('user_id', user.id)
        .order('recipient_name');
      
      if (!recipients) return [];
      
      // Return without Stellar addresses
      return recipients.map(r => {
        const identifier = r.recipient_email || r.recipient_phone || '';
        const identifierType = (r.recipient_identifier_type || 'email') as 'email' | 'phone';
        
        return {
          id: r.id,
          name: r.recipient_name,
          identifier: identifier,
          identifierType: identifierType,
          country: r.country,
          createdAt: r.created_at,
        };
      });
    } catch (error) {
      console.error('Error getting recipients:', error);
      return [];
    }
  }
  
  /**
   * Remove recipient
   */
  static async removeRecipient(recipientId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { error } = await supabase
        .from('favorite_recipients')
        .delete()
        .eq('id', recipientId)
        .eq('user_id', user.id);
      
      return !error;
    } catch (error) {
      console.error('Error removing recipient:', error);
      return false;
    }
  }
  
  /**
   * Get recipient's Stellar address (internal use only)
   * Used by payment service for transactions
   */
  static async getRecipientStellarAddress(recipientId: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: recipient } = await supabase
        .from('favorite_recipients')
        .select('stellar_address')
        .eq('id', recipientId)
        .eq('user_id', user.id)
        .single();
      
      return recipient?.stellar_address || null;
    } catch (error) {
      console.error('Error getting recipient Stellar address:', error);
      return null;
    }
  }
}
