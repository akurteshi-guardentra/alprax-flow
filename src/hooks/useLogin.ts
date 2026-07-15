
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showNumberAuth, setShowNumberAuth] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleFingerprint = async () => {
    if (!window.PublicKeyCredential) {
      toast.error('Your browser does not support fingerprint authentication');
      return;
    }

    try {
      setIsLoading(true);
      toast.error('Fingerprint authentication coming soon');
    } catch (error) {
      toast.error('Failed to authenticate with fingerprint');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberAuth = () => {
    setShowNumberAuth(true);
  };

  const handleNumberSubmit = async (code: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_auth_methods')
        .select('*')
        .eq('auth_method', 'number')
        .eq('auth_number', code)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Invalid authentication code');
        return;
      }

      toast.success('Authentication successful!');
      navigate((await import("@/lib/next-redirect")).consumeNextOr("/dashboard"));
    } catch (error) {
      toast.error('Failed to authenticate with number');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if 2FA is enabled (only check status, never fetch secret)
        const { data: twoFactorData, error: twoFactorError } = await supabase
          .from('two_factor_auth')
          .select('status')
          .eq('user_id', data.user.id)
          .eq('type', 'app')
          .maybeSingle();

        if (twoFactorError) throw twoFactorError;

        if (twoFactorData?.status === 'verified') {
          setShowTwoFactor(true);
          setIsLoading(false);
          return;
        }

        toast.success('Logged in successfully!');
        navigate((await import("@/lib/next-redirect")).consumeNextOr("/dashboard"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verify TOTP server-side via edge function
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (!token) {
        toast.error('Session expired. Please log in again.');
        setShowTwoFactor(false);
        return;
      }

      const response = await supabase.functions.invoke('verify-totp', {
        body: { code: twoFactorCode },
      });

      if (response.error || !response.data?.verified) {
        toast.error('Invalid 2FA code');
        return;
      }

      toast.success('Logged in successfully!');
      navigate((await import("@/lib/next-redirect")).consumeNextOr("/dashboard"));
    } catch (error) {
      toast.error('Failed to verify 2FA code');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    showTwoFactor,
    showNumberAuth,
    setShowNumberAuth,
    twoFactorCode,
    setTwoFactorCode,
    handleLogin,
    handleFingerprint,
    handleNumberAuth,
    handleNumberSubmit,
    handleTwoFactorSubmit
  };
}
