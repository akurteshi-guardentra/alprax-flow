
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlpraxBrandHeader } from "@/components/brand/AlpraxLogo";
import { checkAuthStatus } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen modern-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen modern-gradient relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-2xl animate-modern-pulse"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 safe-area-inset">
        <div className="text-center max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center w-full text-center"
          >
            <div className="mb-8">
              <AlpraxBrandHeader size="xl" showTagline />
            </div>
            
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col items-center space-y-4 w-full max-w-sm mx-auto px-4"
            >
              <Button
                onClick={() => navigate('/welcome')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 text-base sm:text-lg w-full text-center flex items-center justify-center min-h-[48px] rounded-xl shadow-lg"
              >
                Get Started
              </Button>
              
              <div className="text-center w-full flex justify-center px-2">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-white/70 hover:text-white transition-colors underline text-sm text-center block w-full max-w-xs truncate"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
