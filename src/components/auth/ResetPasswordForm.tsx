import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Eye, EyeOff, Check, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "Password is too weak",
    color: "bg-destructive",
  });

  // Password strength checker function
  const checkPasswordStrength = (password: string) => {
    if (password.length === 0) {
      return {
        score: 0,
        message: "Password is required",
        color: "bg-destructive",
      };
    }
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let message = "";
    let color = "";

    switch (score) {
      case 0:
      case 1:
        message = "Password is too weak";
        color = "bg-destructive";
        break;
      case 2:
        message = "Password is weak";
        color = "bg-warning";
        break;
      case 3:
        message = "Password is good";
        color = "bg-primary";
        break;
      case 4:
      case 5:
        message = "Password is strong";
        color = "bg-success";
        break;
      default:
        message = "Password is too weak";
        color = "bg-destructive";
    }

    return { score, message, color };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error("Please use a stronger password");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Password reset successful!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to reset your password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isSuccess ? (
        <>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Reset password</h2>
            <p className="text-white/60">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="text-sm text-white/80 block mb-2">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    className="pl-10 pr-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 transition-all focus:ring-2 focus:ring-primary/50"
                    placeholder="Create a secure password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white/40 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((segment) => (
                        <div 
                          key={segment}
                          className={`h-full flex-1 rounded-full ${
                            segment <= passwordStrength.score
                              ? passwordStrength.color
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-white/60">{passwordStrength.message}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-sm text-white/80 block mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 transition-all focus:ring-2 focus:ring-primary/50"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                
                {/* Password match indicator */}
                {confirmPassword && (
                  <div className="mt-2 flex items-center gap-1">
                    {password === confirmPassword ? (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        <p className="text-xs text-success">Passwords match</p>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <p className="text-xs text-destructive">Passwords don't match</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-light text-white h-12 text-base font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8 text-center"
        >
          <div className="mx-auto bg-success/20 w-20 h-20 rounded-full flex items-center justify-center">
            <Check className="h-10 w-10 text-success" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Password reset successful!</h2>
            <p className="text-white/60 max-w-sm mx-auto">
              Your password has been changed successfully. 
              You will be redirected to the login page.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
