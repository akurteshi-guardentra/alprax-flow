import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Failed to send password reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isSuccess ? (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Forgot password?</h2>
            <p className="text-white/60">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-white/40" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 transition-all focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-light text-white h-12 text-base font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Reset password"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onBackToLogin}
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
            >
              Back to login
            </Button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-8 text-center"
        >
          <div className="mx-auto bg-success/20 w-20 h-20 rounded-full flex items-center justify-center">
            <Check className="h-10 w-10 text-success" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Check your email</h2>
            <p className="text-white/60 max-w-sm mx-auto">
              We've sent a password reset link to <span className="font-medium text-white">{email}</span>
            </p>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              onClick={onBackToLogin}
              className="w-full bg-primary hover:bg-primary-light text-white h-12 text-base font-medium"
            >
              Back to login
            </Button>
            <p className="text-sm text-white/50">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                type="button"
                onClick={handleSubmit}
                className="text-primary-light hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
