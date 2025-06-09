
export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  rewards_earned: number;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed';
  reward_amount: number;
  created_at: string;
  completed_at?: string;
}
