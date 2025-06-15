
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";

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
    <UnifiedLayout 
      showBackButton 
      onBack={() => navigate('/welcome')}
      title="Create Account"
      subtitle="Join AlpraxFlow and start sending money globally"
    >
      <div className="max-w-md mx-auto">
        <div className="glass-card modern-shadow p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white text-center">Create Account</h2>
            <p className="text-white/60 mt-2 text-center">
              Join AlpraxFlow and start sending money globally
            </p>
          </div>
          
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-white/10 border-white/10 text-white placeholder:text-white/40 text-center"
                required
              />
              <Input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-white/10 border-white/10 text-white placeholder:text-white/40 text-center"
                required
              />
            </div>
            
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/10 text-white placeholder:text-white/40 text-center"
              required
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/10 text-white placeholder:text-white/40 text-center"
              required
            />
            
            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-white/90 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-white/60 hover:text-white transition-colors text-center"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default Signup;
