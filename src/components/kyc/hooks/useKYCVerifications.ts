
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { KYCVerification, KYCVerificationStatus } from '../types';
import { getProfileKycLevel } from '../utils';

export const useKYCVerifications = () => {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            country
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        profiles: item.profiles as any
      })) || [];
      
      setVerifications(transformedData as KYCVerification[]);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (verificationId: string, newStatus: KYCVerificationStatus, notes?: string) => {
    try {
      // Update the KYC verification record
      const { error } = await supabase
        .from('kyc_verifications')
        .update({ 
          status: newStatus,
          verified_at: newStatus === 'verified' ? new Date().toISOString() : null,
          notes: notes || null
        })
        .eq('id', verificationId);

      if (error) throw error;
      
      // Also update the user's profile KYC level
      const verification = verifications.find(v => v.id === verificationId);
      if (verification) {
        const profileKycLevel = getProfileKycLevel(newStatus);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            kyc_level: profileKycLevel,
            kyc_verified_at: newStatus === 'verified' ? new Date().toISOString() : null
          })
          .eq('id', verification.user_id);

        if (profileError) throw profileError;
      }

      toast.success(`Verification ${newStatus}`);
      fetchVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification');
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  return {
    verifications,
    loading,
    handleStatusUpdate,
    refetch: fetchVerifications
  };
};
