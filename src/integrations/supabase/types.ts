export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      batch_transfer_items: {
        Row: {
          amount: number
          batch_id: string
          error_message: string | null
          id: string
          recipient_id: string
          status: Database["public"]["Enums"]["batch_status"] | null
          stellar_transaction_id: string | null
        }
        Insert: {
          amount: number
          batch_id: string
          error_message?: string | null
          id?: string
          recipient_id: string
          status?: Database["public"]["Enums"]["batch_status"] | null
          stellar_transaction_id?: string | null
        }
        Update: {
          amount?: number
          batch_id?: string
          error_message?: string | null
          id?: string
          recipient_id?: string
          status?: Database["public"]["Enums"]["batch_status"] | null
          stellar_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_transfer_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batch_transfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_transfer_items_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "favorite_recipients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_transfer_items_stellar_transaction_id_fkey"
            columns: ["stellar_transaction_id"]
            isOneToOne: false
            referencedRelation: "stellar_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_transfers: {
        Row: {
          created_at: string | null
          description: string | null
          error_message: string | null
          id: string
          name: string
          processed_at: string | null
          recipient_count: number
          status: Database["public"]["Enums"]["batch_status"] | null
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          id?: string
          name: string
          processed_at?: string | null
          recipient_count: number
          status?: Database["public"]["Enums"]["batch_status"] | null
          total_amount: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          id?: string
          name?: string
          processed_at?: string | null
          recipient_count?: number
          status?: Database["public"]["Enums"]["batch_status"] | null
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          business_name: string
          business_type: string
          created_at: string | null
          id: string
          industry: string | null
          registration_number: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          business_name: string
          business_type: string
          created_at?: string | null
          id?: string
          industry?: string | null
          registration_number?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          business_name?: string
          business_type?: string
          created_at?: string | null
          id?: string
          industry?: string | null
          registration_number?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          contact_type: string
          created_at: string
          id: string
          identifier: string
          label: string | null
          user_id: string
        }
        Insert: {
          contact_type: string
          created_at?: string
          id?: string
          identifier: string
          label?: string | null
          user_id: string
        }
        Update: {
          contact_type?: string
          created_at?: string
          id?: string
          identifier?: string
          label?: string | null
          user_id?: string
        }
        Relationships: []
      }
      currency_alerts: {
        Row: {
          alert_type: string | null
          created_at: string | null
          current_rate: number | null
          from_currency: string
          id: string
          is_active: boolean | null
          target_rate: number
          to_currency: string
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          current_rate?: number | null
          from_currency: string
          id?: string
          is_active?: boolean | null
          target_rate: number
          to_currency: string
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          current_rate?: number | null
          from_currency?: string
          id?: string
          is_active?: boolean | null
          target_rate?: number
          to_currency?: string
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      early_access_features: {
        Row: {
          created_at: string | null
          description: string | null
          feature_name: string
          id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_name: string
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_name?: string
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          from_currency: string
          id: string
          last_updated: string | null
          rate: number
          to_currency: string
        }
        Insert: {
          from_currency: string
          id?: string
          last_updated?: string | null
          rate: number
          to_currency: string
        }
        Update: {
          from_currency?: string
          id?: string
          last_updated?: string | null
          rate?: number
          to_currency?: string
        }
        Relationships: []
      }
      exchanges: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          from_currency: string
          id: string
          rate: number | null
          status: string
          to_currency: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          from_currency: string
          id?: string
          rate?: number | null
          status?: string
          to_currency: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          from_currency?: string
          id?: string
          rate?: number | null
          status?: string
          to_currency?: string
          user_id?: string
        }
        Relationships: []
      }
      family_groups: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          group_code: string
          id: string
          monthly_goal: number | null
          name: string
          total_savings: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          group_code: string
          id?: string
          monthly_goal?: number | null
          name: string
          total_savings?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          group_code?: string
          id?: string
          monthly_goal?: number | null
          name?: string
          total_savings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          contribution_amount: number | null
          family_group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          contribution_amount?: number | null
          family_group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          contribution_amount?: number | null
          family_group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_recipients: {
        Row: {
          country: string
          created_at: string | null
          currency: string
          id: string
          last_sent_at: string | null
          recipient_name: string
          relationship: string | null
          stellar_address: string
          user_id: string
        }
        Insert: {
          country: string
          created_at?: string | null
          currency: string
          id?: string
          last_sent_at?: string | null
          recipient_name: string
          relationship?: string | null
          stellar_address: string
          user_id: string
        }
        Update: {
          country?: string
          created_at?: string | null
          currency?: string
          id?: string
          last_sent_at?: string | null
          recipient_name?: string
          relationship?: string | null
          stellar_address?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_access: {
        Row: {
          access_type: string
          expires_at: string | null
          feature_name: string
          granted_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          access_type?: string
          expires_at?: string | null
          feature_name: string
          granted_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          access_type?: string
          expires_at?: string | null
          feature_name?: string
          granted_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_tiers: {
        Row: {
          created_at: string | null
          features: Json | null
          id: string
          monthly_price: number
          tier_name: string
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: string
          monthly_price: number
          tier_name: string
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: string
          monthly_price?: number
          tier_name?: string
        }
        Relationships: []
      }
      fee_structure: {
        Row: {
          base_fee_percentage: number
          created_at: string | null
          exchange_rate_margin: number
          id: string
          max_fee: number
          min_fee: number
          tier_level: string
          updated_at: string | null
        }
        Insert: {
          base_fee_percentage: number
          created_at?: string | null
          exchange_rate_margin: number
          id?: string
          max_fee: number
          min_fee: number
          tier_level: string
          updated_at?: string | null
        }
        Update: {
          base_fee_percentage?: number
          created_at?: string | null
          exchange_rate_margin?: number
          id?: string
          max_fee?: number
          min_fee?: number
          tier_level?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      funding_transactions: {
        Row: {
          amount_usd: number
          amount_xlm: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          exchange_rate: number | null
          id: string
          payment_intent_id: string | null
          status: string
          stellar_tx_hash: string | null
          user_id: string
        }
        Insert: {
          amount_usd: number
          amount_xlm?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          exchange_rate?: number | null
          id?: string
          payment_intent_id?: string | null
          status?: string
          stellar_tx_hash?: string | null
          user_id: string
        }
        Update: {
          amount_usd?: number
          amount_xlm?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          exchange_rate?: number | null
          id?: string
          payment_intent_id?: string | null
          status?: string
          stellar_tx_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_transactions_payment_intent_id_fkey"
            columns: ["payment_intent_id"]
            isOneToOne: false
            referencedRelation: "payment_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          additional_documents: Json | null
          document_type: string
          document_url: string
          id: string
          notes: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["kyc_status"] | null
          submitted_at: string | null
          user_id: string
          verification_type: string | null
          verified_at: string | null
        }
        Insert: {
          additional_documents?: Json | null
          document_type: string
          document_url: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["kyc_status"] | null
          submitted_at?: string | null
          user_id: string
          verification_type?: string | null
          verified_at?: string | null
        }
        Update: {
          additional_documents?: Json | null
          document_type?: string
          document_url?: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["kyc_status"] | null
          submitted_at?: string | null
          user_id?: string
          verification_type?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          id: string
          payment_method: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_errors: {
        Row: {
          created_at: string | null
          error_details: Json | null
          error_message: string
          error_type: string
          id: string
          resolved_at: string | null
          retry_count: number | null
          stellar_tx_hash: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          error_message: string
          error_type: string
          id?: string
          resolved_at?: string | null
          retry_count?: number | null
          stellar_tx_hash?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string
          error_type?: string
          id?: string
          resolved_at?: string | null
          retry_count?: number | null
          stellar_tx_hash?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_intents: {
        Row: {
          amount: number
          client_secret: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          status: string
          stripe_payment_intent_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          client_secret?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          status?: string
          stripe_payment_intent_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_secret?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          status?: string
          stripe_payment_intent_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_method_credentials: {
        Row: {
          created_at: string | null
          encrypted_data: string
          id: string
          payment_method_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_data: string
          id?: string
          payment_method_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_data?: string
          id?: string
          payment_method_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_method_credentials_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string | null
          details: Json
          id: string
          is_default: boolean | null
          last_used_at: string | null
          provider: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details: Json
          id?: string
          is_default?: boolean | null
          last_used_at?: string | null
          provider: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json
          id?: string
          is_default?: boolean | null
          last_used_at?: string | null
          provider?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          converted_amount: number
          created_at: string | null
          error_message: string | null
          exchange_rate: number
          from_currency: string
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_provider: string | null
          provider_transaction_id: string | null
          status: string
          to_currency: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          converted_amount: number
          created_at?: string | null
          error_message?: string | null
          exchange_rate: number
          from_currency: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          provider_transaction_id?: string | null
          status?: string
          to_currency: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          converted_amount?: number
          created_at?: string | null
          error_message?: string | null
          exchange_rate?: number
          from_currency?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          provider_transaction_id?: string | null
          status?: string
          to_currency?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          full_name: string | null
          id: string
          kyc_level: string | null
          kyc_verified_at: string | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          onboarding_step: string | null
          phone_number: string | null
          preferred_language: string | null
          reward_tier_id: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          kyc_level?: string | null
          kyc_verified_at?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          phone_number?: string | null
          preferred_language?: string | null
          reward_tier_id?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          kyc_level?: string | null
          kyc_verified_at?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          phone_number?: string | null
          preferred_language?: string | null
          reward_tier_id?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_reward_tier_id_fkey"
            columns: ["reward_tier_id"]
            isOneToOne: false
            referencedRelation: "reward_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_alerts: {
        Row: {
          created_at: string | null
          from_currency: string
          id: string
          is_active: boolean | null
          target_rate: number
          to_currency: string
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          from_currency: string
          id?: string
          is_active?: boolean | null
          target_rate: number
          to_currency: string
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          from_currency?: string
          id?: string
          is_active?: boolean | null
          target_rate?: number
          to_currency?: string
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_clicks: {
        Row: {
          clicked_at: string | null
          conversion_value: number | null
          converted: boolean | null
          converted_at: string | null
          country: string | null
          id: string
          ip_address: unknown | null
          referral_code_id: string
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          converted_at?: string | null
          country?: string | null
          id?: string
          ip_address?: unknown | null
          referral_code_id: string
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          converted_at?: string | null
          country?: string | null
          id?: string
          ip_address?: unknown | null
          referral_code_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_clicks_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          family_bonus_multiplier: number | null
          id: string
          last_reset_date: string | null
          monthly_referrals: number | null
          qr_code_url: string | null
          referral_link: string | null
          rewards_earned: number | null
          successful_conversions: number | null
          tier_level: string | null
          total_clicks: number | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          family_bonus_multiplier?: number | null
          id?: string
          last_reset_date?: string | null
          monthly_referrals?: number | null
          qr_code_url?: string | null
          referral_link?: string | null
          rewards_earned?: number | null
          successful_conversions?: number | null
          tier_level?: string | null
          total_clicks?: number | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          family_bonus_multiplier?: number | null
          id?: string
          last_reset_date?: string | null
          monthly_referrals?: number | null
          qr_code_url?: string | null
          referral_link?: string | null
          rewards_earned?: number | null
          successful_conversions?: number | null
          tier_level?: string | null
          total_clicks?: number | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          reward_amount: number | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          reward_amount?: number | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number | null
          status?: string
        }
        Relationships: []
      }
      remittance_rates: {
        Row: {
          fee_percentage: number
          fixed_fee: number
          from_country: string
          id: string
          processing_time: string
          provider: string
          to_country: string
          updated_at: string | null
        }
        Insert: {
          fee_percentage: number
          fixed_fee: number
          from_country: string
          id?: string
          processing_time: string
          provider: string
          to_country: string
          updated_at?: string | null
        }
        Update: {
          fee_percentage?: number
          fixed_fee?: number
          from_country?: string
          id?: string
          processing_time?: string
          provider?: string
          to_country?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reward_tiers: {
        Row: {
          cashback_percentage: number
          created_at: string | null
          id: number
          monthly_transfer_limit: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          cashback_percentage: number
          created_at?: string | null
          id?: number
          monthly_transfer_limit?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          cashback_percentage?: number
          created_at?: string | null
          id?: number
          monthly_transfer_limit?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reward_transactions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          points: number
          transaction_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          points: number
          transaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          transaction_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stellar_accounts: {
        Row: {
          account_name: string | null
          created_at: string
          encrypted_secret: string
          id: string
          is_primary: boolean | null
          last_sync_at: string | null
          public_key: string
          user_id: string
        }
        Insert: {
          account_name?: string | null
          created_at?: string
          encrypted_secret: string
          id?: string
          is_primary?: boolean | null
          last_sync_at?: string | null
          public_key: string
          user_id: string
        }
        Update: {
          account_name?: string | null
          created_at?: string
          encrypted_secret?: string
          id?: string
          is_primary?: boolean | null
          last_sync_at?: string | null
          public_key?: string
          user_id?: string
        }
        Relationships: []
      }
      stellar_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          fee: number
          fees_saved: number | null
          from_asset: string
          id: string
          memo: string | null
          recipient_country: string | null
          recipient_name: string | null
          status: string
          stellar_tx_hash: string
          to_asset: string
          transaction_type: string
          transfer_category: string | null
          transfer_purpose: string | null
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          fee: number
          fees_saved?: number | null
          from_asset: string
          id?: string
          memo?: string | null
          recipient_country?: string | null
          recipient_name?: string | null
          status?: string
          stellar_tx_hash: string
          to_asset: string
          transaction_type: string
          transfer_category?: string | null
          transfer_purpose?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          fee?: number
          fees_saved?: number | null
          from_asset?: string
          id?: string
          memo?: string | null
          recipient_country?: string | null
          recipient_name?: string | null
          status?: string
          stellar_tx_hash?: string
          to_asset?: string
          transaction_type?: string
          transfer_category?: string | null
          transfer_purpose?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stored_payment_methods: {
        Row: {
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          created_at: string
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string
          type: string
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id: string
          type: string
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_fees: {
        Row: {
          calculated_at: string | null
          fee_amount: number
          fee_type: string
          id: string
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          calculated_at?: string | null
          fee_amount: number
          fee_type: string
          id?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          calculated_at?: string | null
          fee_amount?: number
          fee_type?: string
          id?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_fees_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "stellar_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_queue: {
        Row: {
          amount: number
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          max_attempts: number | null
          memo: string | null
          metadata: Json | null
          priority: number | null
          recipient_address: string
          started_at: string | null
          status: string
          stellar_tx_hash: string | null
          user_id: string
        }
        Insert: {
          amount: number
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          memo?: string | null
          metadata?: Json | null
          priority?: number | null
          recipient_address: string
          started_at?: string | null
          status?: string
          stellar_tx_hash?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          memo?: string | null
          metadata?: Json | null
          priority?: number | null
          recipient_address?: string
          started_at?: string | null
          status?: string
          stellar_tx_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          currency: string
          date: string
          description: string | null
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          currency: string
          date?: string
          description?: string | null
          id?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      transfer_impact_metrics: {
        Row: {
          actual_fee: number
          carbon_footprint_saved: number | null
          cashback_earned: number | null
          created_at: string | null
          fees_saved: number
          id: string
          processing_time_saved: number | null
          reward_tier_id: number | null
          traditional_fee_estimate: number
          transaction_id: string
          user_id: string
        }
        Insert: {
          actual_fee: number
          carbon_footprint_saved?: number | null
          cashback_earned?: number | null
          created_at?: string | null
          fees_saved: number
          id?: string
          processing_time_saved?: number | null
          reward_tier_id?: number | null
          traditional_fee_estimate: number
          transaction_id: string
          user_id: string
        }
        Update: {
          actual_fee?: number
          carbon_footprint_saved?: number | null
          cashback_earned?: number | null
          created_at?: string | null
          fees_saved?: number
          id?: string
          processing_time_saved?: number | null
          reward_tier_id?: number | null
          traditional_fee_estimate?: number
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_impact_metrics_reward_tier_id_fkey"
            columns: ["reward_tier_id"]
            isOneToOne: false
            referencedRelation: "reward_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_impact_metrics_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "stellar_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_recipients: {
        Row: {
          city: string | null
          country: string
          created_at: string | null
          family_group_id: string | null
          id: string
          is_family_member: boolean | null
          local_bank_account: string | null
          mobile_wallet: string | null
          next_scheduled_date: string | null
          preferred_amount: number | null
          recipient_name: string
          relationship: string | null
          stellar_address: string
          transfer_frequency: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          country: string
          created_at?: string | null
          family_group_id?: string | null
          id?: string
          is_family_member?: boolean | null
          local_bank_account?: string | null
          mobile_wallet?: string | null
          next_scheduled_date?: string | null
          preferred_amount?: number | null
          recipient_name: string
          relationship?: string | null
          stellar_address: string
          transfer_frequency?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string
          created_at?: string | null
          family_group_id?: string | null
          id?: string
          is_family_member?: boolean | null
          local_bank_account?: string | null
          mobile_wallet?: string | null
          next_scheduled_date?: string | null
          preferred_amount?: number | null
          recipient_name?: string
          relationship?: string | null
          stellar_address?: string
          transfer_frequency?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_recipients_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_templates: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          frequency: string | null
          id: string
          name: string
          next_transfer_date: string | null
          recipient_id: string
          scheduled_day: number | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          frequency?: string | null
          id?: string
          name: string
          next_transfer_date?: string | null
          recipient_id: string
          scheduled_day?: number | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          frequency?: string | null
          id?: string
          name?: string
          next_transfer_date?: string | null
          recipient_id?: string
          scheduled_day?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_templates_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "favorite_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      two_factor_auth: {
        Row: {
          backup_codes: Json | null
          created_at: string | null
          id: string
          secret: string
          status: Database["public"]["Enums"]["auth_factor_status"] | null
          type: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes?: Json | null
          created_at?: string | null
          id?: string
          secret: string
          status?: Database["public"]["Enums"]["auth_factor_status"] | null
          type: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: Json | null
          created_at?: string | null
          id?: string
          secret?: string
          status?: Database["public"]["Enums"]["auth_factor_status"] | null
          type?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      user_auth_methods: {
        Row: {
          auth_method: Database["public"]["Enums"]["auth_method"]
          auth_number: string | null
          created_at: string | null
          enabled: boolean | null
          fingerprint_hash: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_method: Database["public"]["Enums"]["auth_method"]
          auth_number?: string | null
          created_at?: string | null
          enabled?: boolean | null
          fingerprint_hash?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth_method?: Database["public"]["Enums"]["auth_method"]
          auth_number?: string | null
          created_at?: string | null
          enabled?: boolean | null
          fingerprint_hash?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feature_access: {
        Row: {
          access_expires_at: string | null
          access_granted_at: string | null
          created_at: string | null
          feature_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          created_at?: string | null
          feature_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          created_at?: string | null
          feature_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_access_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "early_access_features"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          cashback_percentage: number
          created_at: string | null
          id: string
          reward_amount: number
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          cashback_percentage: number
          created_at?: string | null
          id?: string
          reward_amount: number
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          cashback_percentage?: number
          created_at?: string | null
          id?: string
          reward_amount?: number
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string
          id: string
          is_primary: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency: string
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      verification_attempts: {
        Row: {
          attempts: number | null
          back_document_url: string | null
          created_at: string | null
          document_type: string | null
          front_document_url: string | null
          id: string
          is_blur: boolean | null
          rejection_reason: string | null
          scan_reference: string | null
          selfie_url: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          back_document_url?: string | null
          created_at?: string | null
          document_type?: string | null
          front_document_url?: string | null
          id?: string
          is_blur?: boolean | null
          rejection_reason?: string | null
          scan_reference?: string | null
          selfie_url?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          back_document_url?: string | null
          created_at?: string | null
          document_type?: string | null
          front_document_url?: string | null
          id?: string
          is_blur?: boolean | null
          rejection_reason?: string | null
          scan_reference?: string | null
          selfie_url?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      verification_results: {
        Row: {
          attempt_id: string
          created_at: string | null
          id: string
          result: Json | null
          verification_type: string
        }
        Insert: {
          attempt_id: string
          created_at?: string | null
          id?: string
          result?: Json | null
          verification_type: string
        }
        Update: {
          attempt_id?: string
          created_at?: string | null
          id?: string
          result?: Json | null
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "verification_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_balances: {
        Row: {
          amount: number
          change: number | null
          currency: string
          id: string
          last_updated: string
          user_id: string
        }
        Insert: {
          amount?: number
          change?: number | null
          currency: string
          id?: string
          last_updated?: string
          user_id: string
        }
        Update: {
          amount?: number
          change?: number | null
          currency?: string
          id?: string
          last_updated?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_completed_orders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_primary_stellar_account: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          encrypted_secret: string
          id: string
          public_key: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      auth_factor_status: "pending" | "verified" | "disabled"
      auth_method: "password" | "fingerprint" | "number"
      batch_status: "pending" | "processing" | "completed" | "failed"
      kyc_status: "basic" | "pending" | "verified"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      auth_factor_status: ["pending", "verified", "disabled"],
      auth_method: ["password", "fingerprint", "number"],
      batch_status: ["pending", "processing", "completed", "failed"],
      kyc_status: ["basic", "pending", "verified"],
    },
  },
} as const
