
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TransferTemplate {
  id: string;
  user_id: string;
  name: string;
  recipient_id: string;
  amount: number;
  currency: string;
  frequency?: 'once' | 'weekly' | 'monthly';
  scheduled_day?: number;
  next_transfer_date?: string;
  created_at: string;
}

export function useTransferTemplates() {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['transfer-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfer_templates')
        .select('*, favorite_recipients!inner(recipient_name)')
        .order('created_at', { ascending: false })
        .returns<(TransferTemplate & { favorite_recipients: { recipient_name: string } })[]>();

      if (error) {
        toast.error('Failed to fetch transfer templates');
        throw error;
      }

      return data;
    }
  });

  const addTemplate = useMutation({
    mutationFn: async (newTemplate: Omit<TransferTemplate, 'id' | 'user_id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transfer_templates')
        .insert([{ ...newTemplate, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-templates'] });
      toast.success('Transfer template created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create transfer template');
      console.error('Transfer template error:', error);
    }
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransferTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('transfer_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-templates'] });
      toast.success('Transfer template updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update transfer template');
      console.error('Update template error:', error);
    }
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transfer_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-templates'] });
      toast.success('Transfer template deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete transfer template');
      console.error('Delete template error:', error);
    }
  });

  return {
    templates,
    isLoading,
    addTemplate: addTemplate.mutate,
    isAdding: addTemplate.isPending,
    updateTemplate: updateTemplate.mutate,
    isUpdating: updateTemplate.isPending,
    deleteTemplate: deleteTemplate.mutate,
    isDeleting: deleteTemplate.isPending
  };
}
