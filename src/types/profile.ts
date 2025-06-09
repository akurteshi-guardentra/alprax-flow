
export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  country: string | null;
  phone_number: string | null;
  preferred_language: string | null;
  avatar_url: string | null;
  email?: string | null;
  kyc_level: 'basic' | 'verified' | 'pending';
  kyc_verified_at: string | null;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
  onboarding_step: string;
  notification_preferences: any;
  reward_tier_id: number | null;
}
