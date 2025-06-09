import React, { ReactNode, useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { useDataSaverMode } from "@/hooks/use-data-saver";
import { useNetworkConditions } from "@/hooks/use-network-conditions";
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
  const isMobile = useMediaQuery("(max-width: 640px)");
  // Get device and network capabilities for optimized rendering
  const { isLowEndDevice, isDataSaverEnabled } = useDataSaverMode();
  const { connectionQuality, isOnline } = useNetworkConditions();
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
  };  // Determine if we should use blur effects (they can be expensive on low-end devices or slow networks)
  const shouldUseBlur = (!isLowEndDevice && connectionQuality !== 'poor') || !isMobile;
  
  // Show network status notification when connection changes
  useEffect(() => {
    if (connectionQuality === 'poor' || !isOnline) {
      setShowNetworkStatus(true);
      // Hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShowNetworkStatus(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [connectionQuality, isOnline]);
  
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
      duration: isLowEndDevice ? 0.2 : connectionQuality === 'poor' ? 0.3 : 0.4,
      type: shouldReduceMotion ? 'tween' : 'spring'
    };
  };
  
  const motionSettings = getMotionSettings();

  return (
    <div className={cn(
      "w-full relative", 
      isMobile ? "px-4" : "max-w-md mx-auto",
      className
    )}>
      {/* Network status indicator */}
      {showNetworkStatus && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 left-0 right-0 z-50 flex justify-center"
        >
          <Badge 
            className={cn(
              "flex items-center gap-1 shadow-lg px-3 py-1.5 text-xs",
              !isOnline 
                ? "bg-red-500 hover:bg-red-500" 
                : connectionQuality === 'poor'
                ? "bg-yellow-500 hover:bg-yellow-500"
                : "bg-green-500 hover:bg-green-500"
            )}
          >
            {!isOnline ? (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Offline Mode</span>
              </>
            ) : connectionQuality === 'poor' ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>Weak Connection</span>
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3" />
                <span>Connected</span>
              </>
            )}
          </Badge>
        </motion.div>
      )}
      
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
          "border border-white/10",
          // Add subtle pulsing effect when connection is poor but not offline
          connectionQuality === 'poor' && isOnline ? "animate-pulse-slow" : ""
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};
