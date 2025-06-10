
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { TwoFactorForm } from "@/components/auth/TwoFactorForm";
import { NumberAuthForm } from "@/components/auth/NumberAuthForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { useLogin } from "@/hooks/useLogin";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen modern-gradient relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-500/15 rounded-full blur-xl animate-modern-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Button 
              variant="ghost" 
              onClick={handleBackNavigation}
              className="glass-card-hover text-white border-none"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gradient-modern">AlpraxFlow</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card modern-shadow p-8"
          >
            {renderAuthContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
