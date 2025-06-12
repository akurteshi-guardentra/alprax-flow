
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { TwoFactorForm } from "@/components/auth/TwoFactorForm";
import { NumberAuthForm } from "@/components/auth/NumberAuthForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { useLogin } from "@/hooks/useLogin";
import { useState } from "react";
import { motion } from "framer-motion";
import { UnifiedAppLayout } from "@/components/layout/UnifiedAppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const {
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
  } = useLogin();

  const handleBackNavigation = () => {
    if (showForgotPassword) {
      setShowForgotPassword(false);
    } else if (showNumberAuth) {
      setShowNumberAuth(false);
    } else {
      navigate("/welcome");
    }
  };

  const getTitle = () => {
    if (showForgotPassword) return "Reset Password";
    if (showTwoFactor) return "Two-Factor Authentication";
    if (showNumberAuth) return "Phone Verification";
    return "Welcome Back";
  };

  const renderAuthContent = () => {
    if (showForgotPassword) {
      return <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />;
    }

    if (showTwoFactor) {
      return (
        <TwoFactorForm
          twoFactorCode={twoFactorCode}
          setTwoFactorCode={setTwoFactorCode}
          isLoading={isLoading}
          onSubmit={handleTwoFactorSubmit}
        />
      );
    }

    if (showNumberAuth) {
      return (
        <NumberAuthForm
          onSubmit={handleNumberSubmit}
          isLoading={isLoading}
          onBack={() => setShowNumberAuth(false)}
        />
      );
    }

    return (
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        onSubmit={handleLogin}
        onFingerprint={handleFingerprint}
        onNumberAuth={handleNumberAuth}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  };

  return (
    <UnifiedAppLayout title={getTitle()} showBack onBack={handleBackNavigation}>
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <LogIn className="h-8 w-8 text-blue-400" />
              </div>
              <CardTitle className="text-white text-2xl">Sign In to AlpraxFlow</CardTitle>
              <p className="text-white/70">Access your secure wallet</p>
            </CardHeader>
            <CardContent>
              {renderAuthContent()}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </UnifiedAppLayout>
  );
};

export default Login;
