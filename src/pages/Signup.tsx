
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { User, Mail, KeyRound, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !firstName || !lastName) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success('Sign up successful! Please check your email for verification.');
        navigate('/verify', { state: { email } });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UnifiedLayout 
      showBackButton 
      onBack={() => navigate('/welcome')}
      title="Create Account"
      subtitle="Join AlpraxFlow and start sending money globally"
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card modern-shadow p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white text-center">Create Account</h2>
            <p className="text-white/60 mt-2 text-center">
              Join AlpraxFlow and start sending money globally
            </p>
          </div>
          
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-white/40 group-focus-within:text-primary-light transition-colors" />
                <Input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-white/40 group-focus-within:text-primary-light transition-colors" />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>
            
            <div className="relative group">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-white/40 group-focus-within:text-primary-light transition-colors" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            
            <div className="relative group">
              <KeyRound className="absolute left-3 top-3 h-5 w-5 text-white/40 group-focus-within:text-primary-light transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 py-3 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 focus:ring-2 focus:ring-primary/50"
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
            
            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-light text-white h-12 text-base font-medium flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-white/60 hover:text-primary-light transition-colors text-center"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};

export default Signup;
