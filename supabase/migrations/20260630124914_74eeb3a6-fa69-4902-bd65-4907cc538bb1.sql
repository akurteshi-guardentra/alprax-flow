
-- 1. Fix profiles_table_public_exposure: tighten KYC admin policy
DROP POLICY IF EXISTS "Admin users can read profiles for KYC verification" ON public.profiles;
CREATE POLICY "Admins can read profiles for KYC verification"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  AND EXISTS (SELECT 1 FROM public.kyc_verifications kv WHERE kv.user_id = profiles.id)
);

-- 2. Fix stellar_accounts_missing_update_delete
CREATE POLICY "Users can update their own stellar accounts"
ON public.stellar_accounts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stellar accounts"
ON public.stellar_accounts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Fix kyc_documents_missing_delete_update (storage bucket policies)
CREATE POLICY "Users can update their own kyc documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'kyc_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'kyc_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own kyc documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Fix stellar_transactions_realtime_no_channel_auth
-- App doesn't subscribe to stellar_transactions realtime; remove from publication to prevent cross-user leakage.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'stellar_transactions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.stellar_transactions';
  END IF;
END$$;

-- 5. Fix SECURITY DEFINER function executable findings
-- Revoke public/anon execute on all SECURITY DEFINER functions, and revoke authenticated where they should only run via triggers or service role.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
-- has_role is referenced inside RLS policies; authenticated needs EXECUTE so policy checks work.

REVOKE EXECUTE ON FUNCTION public.log_sensitive_operation(text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_user_account_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_confirmation_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_completed_orders() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.find_user_by_email(text) FROM PUBLIC, anon;
-- authenticated retains EXECUTE: feature intentionally lets signed-in users look up recipients.

REVOKE EXECUTE ON FUNCTION public.get_user_primary_stellar_account(uuid) FROM PUBLIC, anon;
-- authenticated retains EXECUTE: signed-in users need to load their own primary account.
