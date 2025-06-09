
export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  registration_number?: string;
  business_type: string;
  industry?: string;
  verified: boolean;
  created_at: string;
}

export interface BusinessProfileFormData {
  business_name: string;
  registration_number?: string;
  business_type: string;
  industry?: string;
}
