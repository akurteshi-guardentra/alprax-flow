
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/welcome')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        {/* Main content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="w-full max-w-md mx-auto"
          >
            {/* Card with enhanced glassmorphism */}
            <div className="p-6 sm:p-8 bg-white/10 backdrop-blur-lg rounded-2xl space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-white">Create Account</h2>
                <p className="text-white/60">
                  Sign up to start sending money globally
                </p>
              </div>
              
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/40"
                      required
                    />
                  </div>
                  
                  <div>
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/40"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/10 text-white placeholder:text-white/40"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/10 text-white placeholder:text-white/40"
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-white text-black hover:bg-white/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
