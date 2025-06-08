import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useKYC, KYCStatus as KYCStatusType } from "@/hooks/useKYC";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

interface KYCStatusProps {
  compact?: boolean;
  showActionButton?: boolean;
  className?: string;
}

export const KYCStatus = ({ 
  compact = false, 
  showActionButton = true,
  className 
}: KYCStatusProps) => {
  const navigate = useNavigate();
  const { status, documents } = useKYC();
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { isMobile } = useMobile();
  
  const [isExpanded, setIsExpanded] = useState(!compact);
  
  const getStatusIcon = (status: KYCStatusType) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-green-500`} />;
      case 'pending':
        return <Clock className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-yellow-500`} />;
      case 'rejected':
        return <AlertTriangle className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-red-500`} />;
      default:
        return <Shield className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-blue-500`} />;
    }
  };
  
  const getStatusBadgeColor = (status: KYCStatusType) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getStatusText = (status: KYCStatusType) => {
    switch (status) {
      case 'approved':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Verified';
    }
  };
  
  const getStatusDescription = (status: KYCStatusType) => {
    switch (status) {
      case 'approved':
        return 'Your identity has been verified. You have access to all platform features.';
      case 'pending':
        return 'Your verification is being processed. This usually takes 1-2 business days.';
      case 'rejected':
        return documents?.[0]?.rejection_reason || 'Your verification was rejected. Please try again with valid documents.';
      default:
        return 'Complete KYC verification to unlock all platform features.';
    }
  };

  const toggleExpand = () => {
    if (compact) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm",
        compact ? "p-3" : "p-4",
        className
      )}
    >
      <motion.div
        initial={shouldAnimate ? { opacity: 0 } : undefined}
        animate={{ opacity: 1 }}
        transition={getTransition({ duration: 0.3 })}
        layout={shouldAnimate}
      >
        <div className="flex items-center justify-between" onClick={toggleExpand}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-full flex items-center justify-center",
              compact ? "p-1.5" : "p-2",
              status === 'approved' ? "bg-green-500/20" :
              status === 'pending' ? "bg-yellow-500/20" :
              status === 'rejected' ? "bg-red-500/20" :
              "bg-blue-500/20"
            )}>
              {getStatusIcon(status)}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "font-medium text-white",
                  compact ? "text-sm" : "text-base"
                )}>
                  Identity Verification
                </h3>
                <Badge className={cn(
                  "border ml-1",
                  getStatusBadgeColor(status),
                  compact ? "text-xs px-1.5 py-0" : ""
                )}>
                  {getStatusText(status)}
                </Badge>
              </div>
              
              {(!compact || isExpanded) && (
                <motion.p 
                  className="text-xs text-white/70 mt-1 max-w-md"
                  initial={shouldAnimate && compact ? { opacity: 0, height: 0 } : undefined}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={getTransition({ duration: 0.2 })}
                >
                  {getStatusDescription(status)}
                </motion.p>
              )}
            </div>
          </div>
          
          {compact && (
            <button
              onClick={toggleExpand}
              className="text-white/70 hover:text-white"
            >
              <ChevronRight 
                className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
              />
            </button>
          )}
        </div>
        
        {showActionButton && (!compact || isExpanded) && (
          <motion.div 
            className={cn(
              "mt-3",
              compact ? "ml-10" : "ml-12"
            )}
            initial={shouldAnimate && compact ? { opacity: 0, height: 0 } : undefined}
            animate={{ opacity: 1, height: 'auto' }}
            transition={getTransition({ duration: 0.2, delay: 0.1 })}
          >
            <Button
              variant="outline"
              size={compact || isMobile ? "sm" : "default"}
              className="text-white border-white/20 hover:bg-white/10 text-xs sm:text-sm"
              onClick={() => navigate('/kyc')}
            >
              {status === 'not_submitted' ? 'Complete Verification' :
               status === 'approved' ? 'View Details' :
               status === 'rejected' ? 'Try Again' :
               'Check Status'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
};

export default KYCStatus;
