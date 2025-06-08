import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { withResilience } from '@/utils/network-resilience';

export type KYCStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';
export type DocumentType = 'passport' | 'drivers_license' | 'id_card' | 'utility_bill';

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  file_path: string;
  status: KYCStatus;
  submitted_at: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface KYCState {
  documents: KYCDocument[];
  status: KYCStatus;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for managing KYC verification process
 */
export const useKYC = () => {
  const [kycState, setKYCState] = useState<KYCState>({
    documents: [],
    status: 'not_submitted',
    isLoading: true,
    error: null
  });

  // Load KYC documents and status on mount
  useEffect(() => {
    loadKYCData();
  }, []);

  // Load KYC data with network resilience
  const loadKYCData = async () => {
    setKYCState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Use our network resilience util for better mobile experience
      const getDocuments = withResilience(
        async () => {
          const { data, error } = await supabase
            .from('kyc_documents')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return data as KYCDocument[];
        },
        { 
          cacheKey: `kyc_documents_${user.id}`,
          cacheTime: 5 * 60 * 1000, // 5 minutes
          maxRetries: 2
        }
      );

      // Get documents with resilience
      const documents = await getDocuments();

      // Determine overall status based on documents
      let overallStatus: KYCStatus = 'not_submitted';
      if (documents && documents.length > 0) {
        if (documents.some(doc => doc.status === 'approved')) {
          overallStatus = 'approved';
        } else if (documents.some(doc => doc.status === 'pending')) {
          overallStatus = 'pending';
        } else if (documents.some(doc => doc.status === 'rejected')) {
          overallStatus = 'rejected';
        }
      }

      setKYCState({
        documents: documents || [],
        status: overallStatus,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error("Error loading KYC data:", error);
      setKYCState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error
      }));
    }
  };

  // Upload a new KYC document
  const uploadDocument = async (
    documentType: DocumentType,
    file: File,
    additionalInfo: Record<string, any> = {}
  ) => {
    setKYCState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      const filePath = `kyc/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create record in database
      const { data, error: dbError } = await supabase
        .from('kyc_documents')
        .insert([
          {
            user_id: user.id,
            document_type: documentType,
            file_path: filePath,
            status: 'pending',
            additional_info: additionalInfo
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // Reload KYC data
      await loadKYCData();

      toast.success('Document uploaded successfully! Verification is in progress.');
      return data as KYCDocument;
    } catch (error) {
      console.error("Error uploading KYC document:", error);
      setKYCState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error
      }));
      toast.error('Failed to upload document. Please try again.');
      throw error;
    }
  };

  // Get document download URL
  const getDocumentUrl = async (filePath: string): Promise<string> => {
    try {
      const { data: { publicUrl }, error } = await supabase.storage
        .from('kyc_documents')
        .getPublicUrl(filePath);
        
      if (error) throw error;
      return publicUrl;
    } catch (error) {
      console.error("Error getting document URL:", error);
      toast.error('Failed to get document URL');
      throw error;
    }
  };

  // Cancel KYC verification request
  const cancelVerification = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('kyc_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      // Reload KYC data
      await loadKYCData();
      toast.success('Verification request cancelled');
    } catch (error) {
      console.error("Error cancelling verification:", error);
      toast.error('Failed to cancel verification');
      throw error;
    }
  };

  return {
    ...kycState,
    uploadDocument,
    getDocumentUrl,
    cancelVerification,
    refreshKYCStatus: loadKYCData
  };
};
