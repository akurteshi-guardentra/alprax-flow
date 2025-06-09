
export interface FavoriteRecipient {
  id: string;
  user_id: string;
  recipient_name: string;
  stellar_address: string;
  country: string;
  currency: string;
  relationship?: string;
  last_sent_at?: string;
  created_at?: string;
  avatar_url?: string;
}
