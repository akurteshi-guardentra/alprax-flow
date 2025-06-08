
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { ReactNode } from "react";
import { SecurityBadge } from "./SecurityBadge";
import { cn } from "@/lib/utils";
import { ResponsiveAuthLayout } from "./ResponsiveAuthLayout";
import { useMediaQuery } from "@/hooks/use-mobile";

interface LoginContainerProps {
  children: ReactNode;
  onBack: () => void;
  hideBackButton?: boolean;
}

export const LoginContainer = ({ 
  children, 
  onBack, 
  hideBackButton = false 
}: LoginContainerProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F36] via-[#273053] to-[#121420] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div 
        className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/20 blur-3xl opacity-30"
        style={{ transform: 'translateY(-50%)' }}
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-secondary/30 to-primary/20 rounded-full blur-3xl opacity-20" 
        style={{ transform: 'translate(30%, 50%)' }}
      />
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header with logo and back button */}
        <div className="flex justify-between items-center py-4 sm:py-6">
          <div className="flex items-center">
            {!hideBackButton && (
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-white hover:bg-white/10 transition-colors mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className={isMobile ? "sr-only" : ""}>Back</span>
              </Button>
            )}
            <div className="text-white font-bold text-xl">AlpraxFlow</div>
          </div>
          
          <div className="text-white/60 text-sm hidden sm:block">
            Need help? <a href="#" className="text-primary-light hover:underline transition-colors">Contact support</a>
          </div>
          
          {/* Mobile help button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:bg-white/10"
              onClick={() => window.open("/help", "_blank")}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Main content - using ResponsiveAuthLayout for better mobile support */}
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <ResponsiveAuthLayout>
            <div className="space-y-8 relative">
              {/* Subtle card highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none rounded-xl" />
              
              {/* Content */}
              <div className="relative z-10">
                {children}
                <SecurityBadge />
              </div>
            </div>
          </ResponsiveAuthLayout>
        </div>
        
        {/* Footer */}
        <div className="text-center text-white/40 text-xs py-4">
          © {new Date().getFullYear()} AlpraxFlow. All rights reserved.
        </div>
      </div>
    </div>
  );
};
