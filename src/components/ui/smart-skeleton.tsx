
import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useNetworkConditions } from '@/hooks/use-network-conditions';
import { motion } from 'framer-motion';

interface SmartSkeletonProps {
  count?: number;
  staggered?: boolean;
  reduced?: boolean;
  isCached?: boolean;
  estimatedLoadTime?: number;
  showEstimate?: boolean;
  className?: string;
}

export function SmartSkeleton({
  count = 3,
  staggered = true,
  reduced = false,
  isCached = false,
  estimatedLoadTime,
  showEstimate = true,
  className = ''
}: SmartSkeletonProps) {
  const { rtt, connectionQuality } = useNetworkConditions();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const calculatedEstimatedTime = (() => {
    if (estimatedLoadTime) return estimatedLoadTime;
    if (isCached) return 300;
    
    // Use connectionQuality instead of effectiveConnectionType
    const baseTime = connectionQuality === 'poor' ? 5000 : 
                    connectionQuality === 'moderate' ? 3000 : 2000;
    return baseTime + (rtt || 0);
  })();
  
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const newElapsed = Date.now() - startTime;
      setElapsedTime(newElapsed);
      
      if (newElapsed > calculatedEstimatedTime * 2) {
        setIsVisible(false);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [calculatedEstimatedTime]);
  
  const remainingTimeSeconds = Math.max(
    0, 
    Math.round((calculatedEstimatedTime - elapsedTime) / 1000)
  );
  
  const loadingProgress = Math.min(100, (elapsedTime / calculatedEstimatedTime) * 100);
  
  if (!isVisible) return null;
  
  return (
    <div className={`space-y-4 ${className}`}>
      {showEstimate && (
        <div className="flex items-center justify-between px-4 py-2">
          <div className="text-sm text-gray-500">
            {isCached ? 
              'Loading from cache...' : 
              remainingTimeSeconds > 0 ? 
                `Loading data... ${remainingTimeSeconds}s remaining` :
                'Almost done...'
            }
          </div>
          <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary/70 rounded-full"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {Array(count).fill(0).map((_, i) => (
        <motion.div
          key={i}
          initial={staggered ? { opacity: 0, y: 5 } : { opacity: 1 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: staggered ? i * 0.05 : 0 }}
          className="px-4"
        >
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              
              <div className="flex-1">
                <Skeleton className="w-2/3 h-4 mb-2" />
                
                {!reduced && (
                  <>
                    <Skeleton className="w-1/2 h-3 mb-2" />
                    <Skeleton className="w-1/3 h-3" />
                  </>
                )}
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <Skeleton className="w-16 h-4" />
                {!reduced && <Skeleton className="w-12 h-5 rounded-full" />}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
