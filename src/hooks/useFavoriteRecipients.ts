import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { FavoriteRecipient } from '@/types/favoriteRecipient';

export interface CreateRecipientInput {
  recipient_name: string;
  stellar_address: string;
  country: string;
  currency: string;
  relationship?: string;
}


export function useFavoriteRecipients() {
  const queryClient = useQueryClient();

  const { data: recipients, isLoading, error: recipientsError, refetch } = useQuery({
    queryKey: ['favorite-recipients'],
    queryFn: async () => {
      console.log('Fetching favorite recipients...');
      // Try to fetch from Supabase first
      try {
        const { data, error } = await supabase
          .from('favorite_recipients')
          .select('*')
          .order('recipient_name')
          .returns<FavoriteRecipient[]>();
  
        if (error) {
          console.error('Supabase error fetching recipients:', error);
          throw error;
        }
        
        console.log('Recipients fetched successfully:', data);
        // Return whatever data we got, even if it's empty
        return data || [];
      } catch (error) {
        console.error('Failed to fetch recipients from database', error);
        return [];
      }
    },
  });

  const addRecipient = useMutation({
    mutationFn: async (newRecipient: CreateRecipientInput) => {
      console.log('Adding new recipient:', newRecipient);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
      }

      console.log('User authenticated:', user.id);
      const { data, error } = await supabase
        .from('favorite_recipients')
        .insert([{ ...newRecipient, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error adding recipient:', error);
        throw error;
      }
      console.log('Recipient added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-recipients'] });
      toast.success('Recipient added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add recipient');
      console.error('Add recipient error:', error);
    },
  });

  return {
    recipients,
    isLoading,
    recipientsError,
    refetchRecipients: refetch,
    addRecipient: addRecipient.mutate,
    isAdding: addRecipient.isPending,
  };
}
