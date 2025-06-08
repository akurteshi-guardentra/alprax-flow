import { useEffect } from "react";
import { LoginContainer } from "@/components/auth/LoginContainer";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if the URL has the necessary hash fragment that Supabase adds
    // for password reset URLs
    const hash = location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      toast.error("Invalid or expired password reset link");
      // Redirect to login after a short delay
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location.hash, navigate]);

  const handleBackNavigation = () => {
    navigate("/login");
  };

  return (
    <LoginContainer 
      onBack={handleBackNavigation}
    >
      <ResetPasswordForm />
    </LoginContainer>
  );
};

export default ResetPassword;
