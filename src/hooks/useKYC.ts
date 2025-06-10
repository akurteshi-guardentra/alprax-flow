
import { useState } from 'react';
import { toast } from 'sonner';

export type DocumentType = 'passport' | 'drivers_license' | 'id_card' | 'utility_bill' | 'bank_statement';

export type KYCStatusType = 'pending' | 'verified' | 'rejected' | 'not_submitted';

export interface KYCDocument {
  id: string;
  type: DocumentType;
  url: string;
  status: KYCStatusType;
  submitted_at: string;
  rejection_reason?: string;
}

export interface KYCStatus {
  status: KYCStatusType;
  documents: KYCDocument[];
  canSubmit: boolean;
}

export const useKYC = () => {
  const [status, setStatus] = useState<KYCStatus>({
    status: 'not_submitted',
    documents: [],
    canSubmit: true
  });

  const submitDocuments = async (documents: File[]) => {
    try {
      toast.info('Document submission requires backend setup');
      return { success: false, message: 'Backend setup required' };
    } catch (error) {
      console.error('KYC submission error:', error);
      return { success: false, message: 'Failed to submit documents' };
    }
  };

  const uploadDocument = async (documentType: DocumentType, file: File, additionalInfo: Record<string, any>) => {
    try {
      toast.info('Document upload requires backend setup');
      return { success: false, message: 'Backend setup required' };
    } catch (error) {
      console.error('KYC upload error:', error);
      return { success: false, message: 'Failed to upload document' };
    }
  };

  const checkStatus = async () => {
    try {
      return status;
    } catch (error) {
      console.error('KYC status check error:', error);
      return status;
    }
  };

  const refreshKYCStatus = () => {
    setStatus(prev => ({ ...prev, status: 'not_submitted' }));
  };

  const cancelVerification = (documentId: string) => {
    setStatus(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId),
      status: 'not_submitted'
    }));
  };

  return {
    status: status.status,
    documents: status.documents,
    submitDocuments,
    uploadDocument,
    checkStatus,
    refreshKYCStatus,
    cancelVerification,
    isLoading: false,
    error: null
  };
};
