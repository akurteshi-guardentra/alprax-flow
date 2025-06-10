
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KYCVerificationStatus } from "../types";
import { getProfileKycLevel } from "../utils";

export function useKYCVerifications() {
  const queryClient = useQueryClient();

  const { data: verifications, isLoading } = useQuery({
    queryKey: ['kyc-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const updateVerificationMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { 
      id: string; 
      status: KYCVerificationStatus;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .update({ 
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .select('user_id')
        .single();

      if (error) throw error;

      // Update the user's profile kyc_level based on verification status
      const profileKycLevel = getProfileKycLevel(status);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ kyc_level: profileKycLevel })
        .eq('id', data.user_id);

      if (profileError) throw profileError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-verifications'] });
    }
  });

  return {
    verifications,
    isLoading,
    updateVerification: updateVerificationMutation.mutate,
    isUpdating: updateVerificationMutation.isPending
  };
}
