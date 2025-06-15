
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, KeyRound, Fingerprint, Hash, Eye, EyeOff, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFingerprint: () => Promise<void>;
  onNumberAuth: () => void;
  onForgotPassword: () => void;
}

export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  onSubmit,
  onFingerprint,
  onNumberAuth,
  onForgotPassword
}: LoginFormProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <>
      <div className="unified-header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="unified-title">Welcome back</h2>
          <p className="unified-subtitle">
            Log in to manage your money
          </p>
        </motion.div>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-6 mt-8">
        <div className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-white/40 group-focus-within:text-primary-light transition-colors" />
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 transition-all focus:ring-2 focus:ring-primary/50" 
              required 
            />
          </div>
          <div className="relative group">
            <KeyRound className="absolute left-3 top-3 h-5 w-5 text-white/40 group-focus-within:text-primary-light transition-colors" />
            <Input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="pl-10 pr-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 transition-all focus:ring-2 focus:ring-primary/50" 
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
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-white/60 hover:text-primary-light transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-light text-white h-12 text-base font-medium transition-all flex items-center justify-center" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <LogIn className="mr-2 h-5 w-5" />
                Sign in
              </span>
            )}
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-4 text-sm text-white/40 font-normal text-center">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              type="button" 
              onClick={onFingerprint} 
              className="bg-white/10 hover:bg-white/20 text-white h-12 transition-all flex items-center justify-center" 
              disabled={isLoading}
            >
              <Fingerprint className="mr-2 h-5 w-5" />
              Fingerprint
            </Button>
            <Button 
              type="button" 
              onClick={onNumberAuth} 
              className="bg-white/10 hover:bg-white/20 text-white h-12 transition-all flex items-center justify-center" 
              disabled={isLoading}
            >
              <Hash className="mr-2 h-5 w-5" />
              Number
            </Button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-white/60">
              Don't have an account?{" "}
              <button 
                type="button" 
                onClick={() => navigate("/signup")} 
                className="text-primary-light hover:underline transition-colors font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </form>
    </>
  );
};
