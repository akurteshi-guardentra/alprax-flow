
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { TwoFactorForm } from "@/components/auth/TwoFactorForm";
import { NumberAuthForm } from "@/components/auth/NumberAuthForm";
import { useLogin } from "@/hooks/useLogin";

const Login = () => {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const loginHook = useLogin();

  const handleLoginSuccess = async () => {
    await refreshSession();
    const { consumeNextOr } = await import('@/lib/next-redirect');
    navigate(consumeNextOr('/dashboard'));
  };

  const handleForgotPassword = async () => {
    if (!loginHook.email) {
      toast.error('Please enter your email first');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginHook.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      toast.success('Password reset link sent to your email');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send password reset email');
    }
  };

  if (loginHook.showTwoFactor) {
    return (
      <UnifiedLayout 
        showBackButton 
        onBack={() => window.history.back()}
        title="Two-Factor Authentication"
        subtitle="Enter your 6-digit verification code"
      >
        <div className="max-w-md mx-auto">
          <div className="glass-card modern-shadow p-8">
            <TwoFactorForm
              twoFactorCode={loginHook.twoFactorCode}
              setTwoFactorCode={loginHook.setTwoFactorCode}
              isLoading={loginHook.isLoading}
              onSubmit={loginHook.handleTwoFactorSubmit}
            />
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (loginHook.showNumberAuth) {
    return (
      <UnifiedLayout 
        showBackButton 
        onBack={() => loginHook.setShowNumberAuth(false)}
        title="Number Authentication"
        subtitle="Enter your 6-digit authentication number"
      >
        <div className="max-w-md mx-auto">
          <div className="glass-card modern-shadow p-8">
            <NumberAuthForm
              onSubmit={loginHook.handleNumberSubmit}
              onBack={() => loginHook.setShowNumberAuth(false)}
              isLoading={loginHook.isLoading}
            />
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout 
      showBackButton 
      onBack={() => navigate('/welcome')}
      title="Sign In"
      subtitle="Welcome back to Alprax Flow"
      className="login-centered"
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card modern-shadow p-8"
        >
          <LoginForm
            email={loginHook.email}
            setEmail={loginHook.setEmail}
            password={loginHook.password}
            setPassword={loginHook.setPassword}
            isLoading={loginHook.isLoading}
            onSubmit={async (e) => {
              await loginHook.handleLogin(e);
              if (!loginHook.showTwoFactor && !loginHook.showNumberAuth) {
                handleLoginSuccess();
              }
            }}
            onFingerprint={loginHook.handleFingerprint}
            onNumberAuth={loginHook.handleNumberAuth}
            onForgotPassword={handleForgotPassword}
          />
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};

export default Login;
