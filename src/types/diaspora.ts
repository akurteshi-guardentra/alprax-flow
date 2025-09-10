// Enhanced types for diaspora-focused features

export interface EnhancedReferralCode {
  id: string;
  user_id: string;
  code: string;
  referral_link?: string;
  qr_code_url?: string;
  total_clicks: number;
  successful_conversions: number;
  rewards_earned: number;
  family_bonus_multiplier: number;
  tier_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  monthly_referrals: number;
  last_reset_date: string;
  created_at: string;
}

export interface ReferralClick {
  id: string;
  referral_code_id: string;
  clicked_at: string;
  ip_address?: string;
  user_agent?: string;
  country?: string;
  converted: boolean;
  converted_at?: string;
  conversion_value: number;
}

export interface FamilyGroup {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  group_code: string;
  total_savings: number;
  monthly_goal: number;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_group_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'contributor';
  contribution_amount: number;
  joined_at: string;
}

export interface TransferRecipient {
  id: string;
  user_id: string;
  recipient_name: string;
  stellar_address: string;
  local_bank_account?: string;
  mobile_wallet?: string;
  country: string;
  city?: string;
  relationship?: string;
  preferred_amount?: number;
  transfer_frequency?: 'weekly' | 'monthly' | 'quarterly';
  next_scheduled_date?: string;
  is_family_member: boolean;
  family_group_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CurrencyAlert {
  id: string;
  user_id: string;
  from_currency: string;
  to_currency: string;
  target_rate: number;
  current_rate?: number;
  alert_type: 'above' | 'below';
  is_active: boolean;
  triggered_at?: string;
  created_at: string;
}

export interface ReferralAnalytics {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalEarnings: number;
  monthlyStats: {
    month: string;
    clicks: number;
    conversions: number;
    earnings: number;
  }[];
  tierProgress: {
    current: string;
    next: string;
    progressPercentage: number;
    nextTierRequirement: number;
  };
}

export interface DiasporaCountry {
  code: string;
  name: string;
  flag: string;
  diasporaSize: number;
  mainDestinations: string[];
  averageRemittance: number;
  localBanks: string[];
  mobileWallets: string[];
}