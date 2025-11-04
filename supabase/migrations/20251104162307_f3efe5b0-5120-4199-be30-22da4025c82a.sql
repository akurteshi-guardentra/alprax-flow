-- Add recipient identifier columns to favorite_recipients table
ALTER TABLE public.favorite_recipients
ADD COLUMN recipient_email TEXT,
ADD COLUMN recipient_phone TEXT,
ADD COLUMN recipient_identifier_type TEXT CHECK (recipient_identifier_type IN ('email', 'phone'));

-- Add index for faster lookups
CREATE INDEX idx_favorite_recipients_email ON public.favorite_recipients(recipient_email);
CREATE INDEX idx_favorite_recipients_phone ON public.favorite_recipients(recipient_phone);

-- Migrate existing data from relationship field to new columns
UPDATE public.favorite_recipients
SET 
  recipient_identifier_type = split_part(relationship, ':', 1),
  recipient_email = CASE 
    WHEN split_part(relationship, ':', 1) = 'email' THEN split_part(relationship, ':', 2)
    ELSE NULL
  END,
  recipient_phone = CASE 
    WHEN split_part(relationship, ':', 1) = 'phone' THEN split_part(relationship, ':', 2)
    ELSE NULL
  END
WHERE relationship IS NOT NULL AND relationship LIKE '%:%';

-- Add comment for documentation
COMMENT ON COLUMN public.favorite_recipients.recipient_email IS 'Email identifier for the recipient (if type is email)';
COMMENT ON COLUMN public.favorite_recipients.recipient_phone IS 'Phone identifier for the recipient (if type is phone)';
COMMENT ON COLUMN public.favorite_recipients.recipient_identifier_type IS 'Type of identifier: email or phone';