
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { BusinessProfile, BusinessProfileFormData } from '@/types/business';

export function useBusinessProfile() {
  const queryClient = useQueryClient();

  const { data: businessProfile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .single();

      if (error) throw error;
      return data as BusinessProfile;
    },
  });

  const createBusinessProfile = useMutation({
    mutationFn: async (profileData: BusinessProfileFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('business_profiles')
        .insert([{ ...profileData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      toast.success('Business profile created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create business profile');
      console.error('Business profile error:', error);
    },
  });

  return {
    businessProfile,
    createBusinessProfile: createBusinessProfile.mutate,
    isCreating: createBusinessProfile.isPending,
  };
}
