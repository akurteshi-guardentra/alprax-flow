
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KYCVerificationStatus, ProfileKYCLevel } from "../types";

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
      
      return data?.map(item => ({
        ...item,
        status: mapDbStatusToFrontend(item.status),
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
      const dbStatus = mapFrontendStatusToDb(status);
      
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

      // Map status to profile level using our local function with proper type casting
      const profileKycLevel = mapStatusToProfileLevel(status);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ kyc_level: profileKycLevel as "pending" | "verified" | "basic" })
        .eq('id', data.user_id);

      if (profileError) throw profileError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-verifications'] });
    }
  });

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

function mapDbStatusToFrontend(dbStatus: string): KYCVerificationStatus {
  switch (dbStatus) {
    case 'basic':
      return 'rejected';
    case 'pending':
      return 'pending';
    case 'verified':
      return 'verified';
    default:
      return 'not_submitted';
  }
}

function mapFrontendStatusToDb(status: KYCVerificationStatus): string {
  switch (status) {
    case 'rejected':
      return 'basic';
    case 'pending':
      return 'pending';
    case 'verified':
      return 'verified';
    case 'not_submitted':
      return 'pending';
    default:
      return 'pending';
  }
}

function mapStatusToProfileLevel(status: KYCVerificationStatus): ProfileKYCLevel {
  switch (status) {
    case 'verified':
      return 'verified';
    case 'pending':
    case 'not_submitted':
      return 'pending';
    case 'rejected':
      return 'basic';
    default:
      return 'pending';
  }
}
