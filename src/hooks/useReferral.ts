
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ReferralCode, Referral } from '@/types/referral';

export function useReferral() {
  const queryClient = useQueryClient();

  const { data: referralCode } = useQuery({
    queryKey: ['referral-code'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as ReferralCode;
    },
  });

  const generateReferralCode = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase
        .from('referral_codes')
        .insert([{ code, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-code'] });
      toast.success('Referral code generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate referral code');
      console.error('Referral code error:', error);
    },
  });

  return {
    referralCode,
    generateReferralCode: generateReferralCode.mutate,
    isGenerating: generateReferralCode.isPending,
  };
}
