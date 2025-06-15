
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface UnifiedLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const UnifiedLayout = ({
  children,
  showBackButton = false,
  onBack,
  title,
  subtitle,
  className = ""
}: UnifiedLayoutProps) => {
  return (
    <div className={`min-h-screen modern-gradient ${className}`}>
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-500/15 rounded-full blur-xl animate-modern-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {(showBackButton || title) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="unified-header"
            >
              <div className="flex items-start gap-4">
                {showBackButton && onBack && (
                  <Button 
                    variant="ghost" 
                    onClick={onBack}
                    className="unified-back-button flex-shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                {title && (
                  <div className="flex-1 min-w-0">
                    <h1 className="unified-title">{title}</h1>
                    {subtitle && <p className="unified-subtitle">{subtitle}</p>}
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: title ? 0.2 : 0 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
