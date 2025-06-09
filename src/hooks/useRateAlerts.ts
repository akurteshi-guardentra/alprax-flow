
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RateAlert {
  id: string;
  from_currency: string;
  to_currency: string;
  target_rate: number;
  is_active: boolean;
  created_at: string;
  triggered_at: string | null;
  user_id: string;
}

interface CreateRateAlertParams {
  from_currency: string;
  to_currency: string;
  target_rate: number;
}

export function useRateAlerts() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: rateAlerts, isLoading } = useQuery({
    queryKey: ['rate-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RateAlert[];
    }
  });

  const createAlert = useMutation({
    mutationFn: async (params: CreateRateAlertParams) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('rate_alerts')
        .insert({
          ...params,
          user_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-alerts'] });
      toast.success('Rate alert created successfully');
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error('Failed to create rate alert');
    }
  });

  const deleteAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('rate_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-alerts'] });
      toast.success('Rate alert deleted successfully');
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error('Failed to delete rate alert');
    }
  });

  const toggleAlert = useMutation({
    mutationFn: async ({ alertId, isActive }: { alertId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('rate_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-alerts'] });
      toast.success('Rate alert updated successfully');
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error('Failed to update rate alert');
    }
  });

  return {
    rateAlerts,
    isLoading,
    error,
    createAlert,
    deleteAlert,
    toggleAlert
  };
}
