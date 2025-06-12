
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KYCVerificationStatus, ProfileKYCLevel } from "../types";

// Temporarily disabled KYC functionality
export function useKYCVerifications() {
  const queryClient = useQueryClient();

  const { data: verifications, isLoading } = useQuery({
    queryKey: ['kyc-verifications'],
    queryFn: async () => {
      // Return empty array for now
      return [];
    }
  });

  const updateVerificationMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { 
      id: string; 
      status: KYCVerificationStatus;
      notes?: string;
    }) => {
      // Disabled for now
      throw new Error("KYC functionality temporarily disabled");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-verifications'] });
    }
  });

  const handleStatusUpdate = (verificationId: string, status: KYCVerificationStatus, notes?: string) => {
    // Disabled for now
    console.log("KYC functionality temporarily disabled");
  };

  return {
    verifications: [],
    isLoading: false,
    updateVerification: handleStatusUpdate,
    isUpdating: false
  };
}
