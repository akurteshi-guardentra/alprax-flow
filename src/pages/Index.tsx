
import { motion } from "framer-motion";
import { TransactionHistory } from "@/components/TransactionHistory";
import { StellarAccount } from "@/components/stellar-account"; // <-- Updated import path
import { TransactionForm } from "@/components/TransactionForm";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { signOut } from "@/lib/auth";
import { LogOut, User, Wallet, Bell, Settings, Globe, CreditCard, FileCheck, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTheme } from "@/hooks/use-theme";
import { useEffect } from "react";
import { logEnvironmentConfig, validateEnvironmentConfig } from "@/config/environment";
import { toast } from "sonner";
import { getDeploymentInfo } from "@/config/deployment";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  // Initialize environment configuration
  useEffect(() => {
    // Log environment configuration in development
    if (import.meta.env.DEV) {
      logEnvironmentConfig();
      console.info(getDeploymentInfo());
    }
    
    // Validate environment configuration
    const configErrors = validateEnvironmentConfig();
    if (configErrors.length > 0) {
      configErrors.forEach(error => {
        console.error(`Configuration error: ${error}`);
      });
      toast.error("Configuration issues detected. Some features may be unavailable.");
    }
  }, []);

  const handleLogout = async () => {
    const success = await signOut();
    if (success) {
      navigate('/login');
    }
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-black p-2 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-8 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-purple-600/10 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Content Container */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10"
      >
        {/* Header with Navigation */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center mb-6 sm:mb-8 px-2"
        >
          <motion.h1 
            className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70"
          >
            Money Transfer
          </motion.h1>
          <div className="flex gap-2">
            {!isMobile && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/profile')}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/analytics')}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm"
                >
                  <BarChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/settings')}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm"
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Settings
                </Button>
                <LanguageSelector />
              </>
            )}
            <Card 
              className="cursor-pointer bg-white/5 hover:bg-white/10 transition-colors border-white/10 backdrop-blur-sm"
              onClick={handleLogout}
            >
              <CardContent className="p-2 sm:p-3 flex items-center justify-center gap-2">
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                {!isMobile && <span className="text-white text-sm">Logout</span>}
              </CardContent>
            </Card>
          </div>
        </motion.div>
        
        {isMobile && (
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-end mb-4"
          >
            <LanguageSelector />
          </motion.div>
        )}
        
        <motion.div
          variants={containerVariants}
          className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
        >
          <motion.div variants={itemVariants}>
            <StellarAccount />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <SecurityDashboard />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <TransactionForm />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <TransactionHistory />
          </motion.div>
        </motion.div>
      </motion.div>
      
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Index;
