
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { useEffect } from "react";
import { config } from "@/config/environment";
import { deploymentConfig } from "@/config/deployment";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Analytics = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Log environment details in development mode
    if (import.meta.env.DEV) {
      console.log('Analytics environment:', {
        environment: deploymentConfig.environment,
        analyticsEnabled: config.analyticsEnabled
      });
    }
    
    // Inform users when they're in test mode
    if (config.enableTestFeatures && deploymentConfig.environment !== 'production') {
      toast.info('You are using Analytics in test mode');
    }
  }, []);
  
  const handleBack = () => {
    navigate('/dashboard');
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
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        </div>
        
        {deploymentConfig.environment === 'development' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 mb-6 text-yellow-200 text-sm">
            Development environment detected. Some analytics features may be using simulated data.
          </div>
        )}
        
        <DashboardAnalytics />
        
        <div className="mt-6 text-xs text-white/30 text-right">
          {deploymentConfig.version} • {deploymentConfig.environment}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
