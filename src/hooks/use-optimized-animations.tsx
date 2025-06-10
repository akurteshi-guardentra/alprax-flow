
import { useMemo } from 'react';

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  type?: 'spring' | 'tween';
  stiffness?: number;
  damping?: number;
}

export const useOptimizedAnimations = () => {
  const shouldAnimate = useMemo(() => {
    // Simple check for reduced motion preference
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const getTransition = (config: AnimationConfig = {}) => {
    if (!shouldAnimate) {
      return { duration: 0 };
    }

    return {
      duration: config.duration || 0.3,
      delay: config.delay || 0,
      type: config.type || 'tween',
      ...(config.type === 'spring' && {
        stiffness: config.stiffness || 400,
        damping: config.damping || 25
      })
    };
  };

  const getItemVariants = (index = 0) => ({
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: getTransition({ delay: index * 0.1 })
    },
    exit: { opacity: 0, y: -20 }
  });

  return {
    shouldAnimate,
    getTransition,
    getItemVariants,
    maxConcurrentAnimations: 50
  };
};
