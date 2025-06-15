
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { authenticator } from "otplib";

export function useLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showNumberAuth, setShowNumberAuth] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');

  const handleFingerprint = async () => {
    if (!window.PublicKeyCredential) {
      toast.error('Your browser does not support fingerprint authentication');
      return;
    }

    try {
      setIsLoading(true);
      toast.error('Fingerprint authentication coming soon');
    } catch (error) {
      console.error('Fingerprint auth error:', error);
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
      navigate("/dashboard");
    } catch (error) {
      console.error('Number auth error:', error);
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
        const { data: twoFactorData, error: twoFactorError } = await supabase
          .from('two_factor_auth')
          .select('secret, status')
          .eq('user_id', data.user.id)
          .eq('type', 'app')
          .maybeSingle();

        if (twoFactorError) throw twoFactorError;

        if (twoFactorData?.status === 'verified') {
          setTwoFactorSecret(twoFactorData.secret);
          setShowTwoFactor(true);
          setIsLoading(false);
          return;
        }

        toast.success('Logged in successfully!');
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isValid = authenticator.verify({
        token: twoFactorCode,
        secret: twoFactorSecret
      });

      if (!isValid) {
        toast.error('Invalid 2FA code');
        return;
      }

      toast.success('Logged in successfully!');
      navigate("/dashboard");
    } catch (error) {
      console.error('2FA verification error:', error);
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
