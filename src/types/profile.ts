
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  country: string | null;
  preferred_language: string | null;
  kyc_level: 'pending' | 'verified' | 'basic';
  username: string | null;
  email: string | null;
  created_at?: string;
  updated_at?: string;
  kyc_verified_at?: string | null;
  onboarding_completed?: boolean;
  onboarding_step?: string;
  notification_preferences?: any;
  reward_tier_id?: number | null;
}
