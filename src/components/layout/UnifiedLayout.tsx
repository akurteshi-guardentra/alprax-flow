
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnifiedLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export const UnifiedLayout = ({ 
  children, 
  title, 
  showBackButton = true, 
  onBack, 
  className = "" 
}: UnifiedLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-500/15 rounded-full blur-xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with logo and back button */}
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  className="text-white hover:bg-white/10 transition-colors mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className={isMobile ? "sr-only" : ""}>Back</span>
                </Button>
              )}
              <div className="text-white font-bold text-xl">AlpraxFlow</div>
            </div>
            
            <div className="text-white/60 text-sm hidden sm:block">
              Need help? <a href="/help" className="text-blue-300 hover:underline transition-colors">Contact support</a>
            </div>
            
            {/* Mobile help button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:bg-white/10"
                onClick={() => navigate("/help")}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white">{title}</h1>
          </motion.div>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${className}`}
          >
            {children}
          </motion.div>
          
          {/* Footer */}
          <div className="text-center text-white/40 text-xs py-4 mt-8">
            © {new Date().getFullYear()} AlpraxFlow. Powered by Stellar blockchain.
          </div>
        </div>
      </div>
    </div>
  );
};
