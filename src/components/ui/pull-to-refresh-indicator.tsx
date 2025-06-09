import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullProgress: number; // Value between 0 and 1
  isRefreshing: boolean;
  className?: string;
}

export function PullToRefreshIndicator({
  pullProgress,
  isRefreshing,
  className = ''
}: PullToRefreshIndicatorProps) {
  // Calculate styles based on pull progress
  const opacity = Math.min(1, pullProgress * 2); // Full opacity at 50% pull
  const scale = 0.8 + (pullProgress * 0.2); // Scale from 80% to 100%
  const rotation = pullProgress * 360; // Full rotation based on pull
  
  return (
    <motion.div 
      className={`absolute left-1/2 transform -translate-x-1/2 z-10 ${className}`}
      style={{
        top: isRefreshing ? '1rem' : `-${50 - (pullProgress * 60)}px`,
        opacity: isRefreshing ? 1 : opacity,
      }}
      animate={{ 
        rotate: isRefreshing ? [0, 360] : rotation,
        scale: scale
      }}
      transition={{
        rotate: { 
          repeat: isRefreshing ? Infinity : 0,
          duration: isRefreshing ? 1 : 0,
          ease: 'linear'
        }
      }}
    >
      <div className="bg-white/10 backdrop-blur-md rounded-full p-3 flex items-center justify-center shadow-lg border border-white/20">
        <RefreshCw 
          className="h-5 w-5 text-primary dark:text-primary-light" 
          style={{ 
            transformOrigin: 'center',
          }}
        />
      </div>
    </motion.div>
  );
}
