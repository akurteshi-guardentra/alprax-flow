
import React, { ReactNode, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { useDataSaverMode } from "@/hooks/use-data-saver";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResponsiveAuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveAuthLayout = ({ 
  children, 
  className 
}: ResponsiveAuthLayoutProps) => {
  const isMobile = useIsMobile();
  // Get device and network capabilities for optimized rendering
  const { isLowEndDevice, isDataSaverEnabled } = useDataSaverMode();
  const { 
    shouldAnimate, 
    getTransition,
    reduceMotion
  } = useOptimizedAnimations();
  const [showNetworkStatus, setShowNetworkStatus] = useState(false);
  
  // Determine optimal padding based on device capabilities and screen size
  const getPadding = () => {
    if (isMobile) {
      return isLowEndDevice ? "p-4" : "p-5";
    } else {
      return "p-8";
    }
  };

  // Determine if we should use blur effects (they can be expensive on low-end devices)
  const shouldUseBlur = (!isLowEndDevice) || !isMobile;
  
  // Calculate reduced motion and other optimizations for mobile
  const getMotionSettings = () => {
    // Reduce animation on low-end devices or when in data saver mode
    const shouldReduceMotion = isLowEndDevice || isDataSaverEnabled || reduceMotion;
    
    // Animation properties optimized for device capabilities
    return {
      initial: shouldAnimate 
        ? { 
            opacity: 0, 
            y: shouldReduceMotion ? 5 : 20,
            scale: shouldReduceMotion ? 1 : 0.98
          } 
        : { opacity: 1, y: 0, scale: 1 },
      duration: isLowEndDevice ? 0.2 : 0.4,
      type: shouldReduceMotion ? 'tween' as const : 'spring' as const
    };
  };
  
  const motionSettings = getMotionSettings();

  return (
    <div className={cn(
      "w-full relative", 
      isMobile ? "px-4" : "max-w-md mx-auto",
      className
    )}>
      
      <motion.div
        // Use optimized animations based on device capabilities
        initial={motionSettings.initial}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={getTransition({ 
          duration: motionSettings.duration,
          type: motionSettings.type
        })}
        className={cn(
          "w-full rounded-2xl overflow-hidden",
          isLowEndDevice ? "shadow-lg" : "shadow-xl",
          getPadding(),
          "bg-white/[0.07]",
          // Only apply backdrop blur on capable devices
          shouldUseBlur ? "backdrop-blur-xl" : "",
          "border border-white/10"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};
