
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { TwoFactorForm } from "@/components/auth/TwoFactorForm";
import { NumberAuthForm } from "@/components/auth/NumberAuthForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { LoginContainer } from "@/components/auth/LoginContainer";
import { useLogin } from "@/hooks/useLogin";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
    <LoginContainer 
      onBack={handleBackNavigation}
      hideBackButton={false}
    >
      {renderAuthContent()}
    </LoginContainer>
  );
};

export default Login;
