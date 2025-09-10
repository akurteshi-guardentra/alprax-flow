-- Enhanced Referral System for Diaspora Features
-- 1. Update referral_codes table with enhanced features
ALTER TABLE public.referral_codes 
ADD COLUMN IF NOT EXISTS referral_link TEXT,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS successful_conversions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS family_bonus_multiplier NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS tier_level TEXT DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS monthly_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Create referral_clicks table for tracking
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  country TEXT,
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  conversion_value NUMERIC DEFAULT 0
);

ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;

-- 3. Create family_groups table for family financial management
CREATE TABLE IF NOT EXISTS public.family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  group_code TEXT UNIQUE NOT NULL,
  total_savings NUMERIC DEFAULT 0,
  monthly_goal NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;

-- 4. Create family_members table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'member', 'contributor'
  contribution_amount NUMERIC DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(family_group_id, user_id)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- 5. Create transfer_recipients table for multi-recipient management
CREATE TABLE IF NOT EXISTS public.transfer_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  stellar_address TEXT NOT NULL,
  local_bank_account TEXT,
  mobile_wallet TEXT,
  country TEXT NOT NULL,
  city TEXT,
  relationship TEXT,
  preferred_amount NUMERIC,
  transfer_frequency TEXT, -- 'weekly', 'monthly', 'quarterly'
  next_scheduled_date TIMESTAMP WITH TIME ZONE,
  is_family_member BOOLEAN DEFAULT false,
  family_group_id UUID REFERENCES public.family_groups(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.transfer_recipients ENABLE ROW LEVEL SECURITY;

-- 6. Create currency_alerts table for smart notifications
CREATE TABLE IF NOT EXISTS public.currency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  target_rate NUMERIC NOT NULL,
  current_rate NUMERIC,
  alert_type TEXT DEFAULT 'above', -- 'above', 'below'
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.currency_alerts ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Referral clicks policies
CREATE POLICY "Users can view referral clicks for their codes"
ON public.referral_clicks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.referral_codes rc 
    WHERE rc.id = referral_clicks.referral_code_id 
    AND rc.user_id = auth.uid()
  )
);

-- Family groups policies
CREATE POLICY "Users can create family groups"
ON public.family_groups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Family members can view their groups"
ON public.family_groups
FOR SELECT
TO authenticated
USING (
  auth.uid() = creator_id OR
  EXISTS (
    SELECT 1 FROM public.family_members fm 
    WHERE fm.family_group_id = family_groups.id 
    AND fm.user_id = auth.uid()
  )
);

CREATE POLICY "Family admins can update groups"
ON public.family_groups
FOR UPDATE
TO authenticated
USING (
  auth.uid() = creator_id OR
  EXISTS (
    SELECT 1 FROM public.family_members fm 
    WHERE fm.family_group_id = family_groups.id 
    AND fm.user_id = auth.uid() 
    AND fm.role = 'admin'
  )
);

-- Family members policies
CREATE POLICY "Family members can view their memberships"
ON public.family_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.family_groups fg 
    WHERE fg.id = family_members.family_group_id 
    AND fg.creator_id = auth.uid()
  )
);

CREATE POLICY "Family admins can manage members"
ON public.family_members
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.family_groups fg 
    WHERE fg.id = family_members.family_group_id 
    AND fg.creator_id = auth.uid()
  )
);

-- Transfer recipients policies
CREATE POLICY "Users can manage their recipients"
ON public.transfer_recipients
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Currency alerts policies
CREATE POLICY "Users can manage their currency alerts"
ON public.currency_alerts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_family_groups_updated_at
  BEFORE UPDATE ON public.family_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transfer_recipients_updated_at
  BEFORE UPDATE ON public.transfer_recipients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();