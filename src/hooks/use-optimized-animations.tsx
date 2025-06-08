import { useMemo } from 'react';
import type { Transition } from 'framer-motion';
import { useDataSaverMode } from '@/hooks/use-data-saver';

/**
 * Hook that provides optimized animation settings based on device capabilities
 * It automatically scales down or disables animations on low-end devices
 */
export function useOptimizedAnimations() {
  const { isLowEndDevice } = useDataSaverMode();
  
  // Calculate appropriate animation settings based on device capability
  const animationSettings = useMemo(() => {
    // Define base settings for high-end devices
    const baseSettings = {
      enabled: true,
      duration: 0.3,
      delayPerItem: 0.05,
      stagger: true,
      reduceMotion: false,
      // Force disable resource-intensive animations like parallax
      disableParallax: false, 
      // Limit the number of concurrent animations
      maxConcurrentAnimations: 10
    };
    
    // Detect if user prefers reduced motion at the OS level
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Honor user's preference for reduced motion
      return {
        ...baseSettings,
        enabled: true, // Keep minimal animations
        duration: 0.15,
        delayPerItem: 0.02,
        stagger: false,
        reduceMotion: true,
        disableParallax: true,
        maxConcurrentAnimations: 3
      };
    }
    
    if (isLowEndDevice) {
      // Scale back animations on low-end devices
      return {
        ...baseSettings,
        duration: 0.2,
        delayPerItem: 0.03,
        stagger: true,
        disableParallax: true,
        maxConcurrentAnimations: 5
      };
    }
    
    // Return default settings for high-end devices
    return baseSettings;
  }, [isLowEndDevice]);
  
  // Generate Framer Motion variants based on current settings
  const getItemVariants = (index = 0) => ({
    hidden: { 
      opacity: animationSettings.enabled ? 0 : 1,
      y: animationSettings.enabled && !animationSettings.reduceMotion ? 10 : 0 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: animationSettings.enabled ? {
        duration: animationSettings.duration,
        delay: animationSettings.stagger ? Math.min(
          index * animationSettings.delayPerItem, 
          animationSettings.maxConcurrentAnimations * animationSettings.delayPerItem
        ) : 0
      } : { duration: 0 }
    },
    exit: { 
      opacity: animationSettings.enabled ? 0 : 1,
      y: animationSettings.enabled && !animationSettings.reduceMotion ? 10 : 0,
      transition: { 
        duration: animationSettings.enabled ? animationSettings.duration * 0.7 : 0 
      }
    }
  });
  
  // Get optimized transition settings
  const getTransition = (customSettings = {}): Transition => {
    if (!animationSettings.enabled) {
      return { duration: 0 };
    }
    
    return {
      type: animationSettings.reduceMotion ? 'tween' : 'spring',
      duration: animationSettings.duration,
      ...(animationSettings.reduceMotion ? {} : { 
        bounce: 0.1, 
        damping: 12, 
        stiffness: 150 
      }),
      ...customSettings
    };
  };
  
  // Get hover animation settings
  const getHoverAnimation = () => {
    if (!animationSettings.enabled || animationSettings.reduceMotion) {
      return {};
    }
    
    return {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    };
  };
  
  return {
    ...animationSettings,
    getItemVariants,
    getTransition,
    getHoverAnimation,
    // Helper function to completely skip animations if needed
    shouldAnimate: animationSettings.enabled
  };
}
