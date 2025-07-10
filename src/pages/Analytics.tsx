
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { useEffect } from "react";
import { ENV } from "@/config/environment";
import { deploymentConfig } from "@/config/deployment";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart } from "lucide-react";
import { motion } from "framer-motion";

const Analytics = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Log environment details in development mode
    if (import.meta.env.DEV) {
      console.log('Analytics environment:', {
        environment: deploymentConfig.environment,
        analyticsEnabled: ENV.FEATURES.ENABLE_ANALYTICS
      });
    }
    
    // Inform users when they're in test mode
    if (ENV.isDevelopment && deploymentConfig.environment !== 'production') {
      toast.info('You are using Analytics in test mode');
    }
  }, []);
  
  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen modern-gradient relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-500/15 rounded-full blur-xl animate-modern-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="glass-card-hover text-white border-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gradient-modern flex items-center gap-3">
            <BarChart className="h-8 w-8" />
            Analytics Dashboard
          </h1>
        </motion.div>
        
        {deploymentConfig.environment === 'development' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card warning-card p-4 mb-6"
          >
            <p className="text-yellow-300 text-sm">
              Development environment detected. Some analytics features may be using simulated data.
            </p>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DashboardAnalytics />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-xs text-white/30 text-right"
        >
          {deploymentConfig.version} • {deploymentConfig.environment}
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
