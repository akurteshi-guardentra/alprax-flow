
import { motion } from "framer-motion";
import { TransactionHistory } from "@/components/TransactionHistory";
import { StellarAccount } from "@/components/stellar-account";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { SimplifiedPaymentFlow } from "@/components/transaction/SimplifiedPaymentFlow";
import { signOut } from "@/lib/auth";
import { LogOut, User, BarChart, Settings, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTheme } from "@/hooks/use-theme";
import { useEffect, useState } from "react";
import { logEnvironmentConfig, validateEnvironmentConfig } from "@/config/environment";
import { toast } from "sonner";
import { getDeploymentInfo } from "@/config/deployment";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<'overview' | 'send-money' | 'security'>('overview');

  useEffect(() => {
    if (import.meta.env.DEV) {
      logEnvironmentConfig();
      console.info(getDeploymentInfo());
    }
    
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
    <div className="min-h-screen modern-gradient p-2 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-8 relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-2xl animate-modern-pulse"></div>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10"
      >
        {/* Modern Header */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center mb-6 sm:mb-8 px-2"
        >
          <motion.h1 
            className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-modern"
          >
            Alprax Flow
          </motion.h1>
          <div className="flex gap-2">
            {!isMobile && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/modern-dashboard')}
                  className="glass-card-hover text-white border-none"
                >
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/profile')}
                  className="glass-card-hover text-white border-none"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/analytics')}
                  className="glass-card-hover text-white border-none"
                >
                  <BarChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/settings')}
                  className="glass-card-hover text-white border-none"
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Settings
                </Button>
                <LanguageSelector />
              </>
            )}
            <Card 
              className="cursor-pointer glass-card-hover modern-shadow"
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

        {/* Section Navigation */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="inline-flex bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            <Button
              variant="ghost"
              onClick={() => setActiveSection('overview')}
              className={`rounded-md px-4 py-2 text-sm ${
                activeSection === 'overview'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Overview
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveSection('send-money')}
              className={`rounded-md px-4 py-2 text-sm ${
                activeSection === 'send-money'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Send Money
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveSection('security')}
              className={`rounded-md px-4 py-2 text-sm ${
                activeSection === 'security'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Security
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
        >
          {/* Always show balance */}
          <motion.div variants={itemVariants}>
            <StellarAccount />
          </motion.div>

          {/* Conditional content based on active section */}
          {activeSection === 'overview' && (
            <motion.div variants={itemVariants}>
              <TransactionHistory />
            </motion.div>
          )}

          {activeSection === 'send-money' && (
            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
                <CardContent className="p-6">
                  <SimplifiedPaymentFlow isMobile={isMobile} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'security' && (
            <motion.div variants={itemVariants}>
              <SecurityDashboard />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Index;
