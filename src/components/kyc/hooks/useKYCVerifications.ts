
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KYCVerificationStatus, ProfileKYCLevel } from "../types";
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
          profiles!inner(
            full_name,
            username,
            country
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our KYCVerification type
      return data?.map(item => ({
        ...item,
        status: item.status === 'basic' ? 'pending' : item.status as KYCVerificationStatus,
        submitted_at: item.submitted_at || new Date().toISOString(),
        verified_at: item.verified_at || undefined,
        notes: item.notes || undefined,
        rejection_reason: item.rejection_reason || undefined,
        verification_type: item.verification_type || undefined,
        additional_documents: item.additional_documents || undefined
      })) || [];
    }
  });

  const updateVerificationMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { 
      id: string; 
      status: KYCVerificationStatus;
      notes?: string;
    }) => {
      // Map our status to database status
      const dbStatus = status === 'rejected' ? 'basic' : status;
      
      const { data, error } = await supabase
        .from('kyc_verifications')
        .update({ 
          status: dbStatus,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .select('user_id')
        .single();

      if (error) throw error;

      // Update the user's profile kyc_level based on verification status
      const profileKycLevel: ProfileKYCLevel = getProfileKycLevel(status);
      
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

  // Create a wrapper function that matches the expected signature
  const handleStatusUpdate = (verificationId: string, status: KYCVerificationStatus, notes?: string) => {
    updateVerificationMutation.mutate({ id: verificationId, status, notes });
  };

  return {
    verifications,
    isLoading,
    updateVerification: handleStatusUpdate,
    isUpdating: updateVerificationMutation.isPending
  };
}
