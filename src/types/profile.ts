
export type KYCStatus = "pending" | "verified" | "basic" | "rejected";

export interface Profile {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  country?: string;
  phone_number?: string;
  kyc_level: "pending" | "verified" | "basic";
  kyc_verified_at?: string;
  onboarding_completed: boolean;
  onboarding_step?: string;
  preferred_language?: string;
  notification_preferences?: any;
  reward_tier_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface KYCVerification {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
  verified_at?: string;
  rejection_reason?: string;
  notes?: string;
  verification_type?: string;
  additional_documents?: any;
  profiles?: Profile;
}
