
-- Payment Rules table for AutoPay Agent
CREATE TABLE public.payment_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('scheduled', 'conditional', 'split')),
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  next_trigger_at TIMESTAMPTZ,
  execution_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat Messages table for AI Agent conversations
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_payment_rules_user_id ON public.payment_rules(user_id);
CREATE INDEX idx_payment_rules_active_next ON public.payment_rules(is_active, next_trigger_at) WHERE is_active = true;
CREATE INDEX idx_chat_messages_user_conv ON public.chat_messages(user_id, conversation_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at);

-- Enable RLS
ALTER TABLE public.payment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_rules
CREATE POLICY "Users can view their own payment rules"
  ON public.payment_rules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment rules"
  ON public.payment_rules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment rules"
  ON public.payment_rules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment rules"
  ON public.payment_rules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for chat_messages
CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Updated_at trigger for payment_rules
CREATE TRIGGER update_payment_rules_updated_at
  BEFORE UPDATE ON public.payment_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Service role policy for evaluate-rules edge function
CREATE POLICY "Service role can read active rules"
  ON public.payment_rules FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update rules"
  ON public.payment_rules FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
