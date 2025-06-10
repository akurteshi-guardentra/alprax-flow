
export type KYCVerificationStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted';
export type ProfileKYCLevel = 'pending' | 'verified' | 'basic';

export interface KYCVerification {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: KYCVerificationStatus;
  submitted_at: string;
  verified_at?: string;
  notes?: string;
  rejection_reason?: string;
  verification_type?: string;
  additional_documents?: any;
  profiles?: {
    full_name?: string;
    username?: string;
    country?: string;
  } | null;
}
