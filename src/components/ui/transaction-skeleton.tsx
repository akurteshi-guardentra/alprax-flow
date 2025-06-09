import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataSaverMode } from '@/hooks/use-data-saver';

interface TransactionSkeletonProps {
  count?: number;
  staggered?: boolean;
  reduced?: boolean;
}

/**
 * Enhanced skeleton loading component for transactions
 * - Optimizes appearance based on device capabilities
 * - Uses staggered loading for better perceived performance
 * - Reduces animations on low-end devices
 */
export function TransactionSkeleton({
  count = 4,
  staggered = true,
  reduced = false,
}: TransactionSkeletonProps) {
  const { isLowEndDevice } = useDataSaverMode();
  const [itemsToShow, setItemsToShow] = useState(reduced || isLowEndDevice ? 2 : count);
  
  // Progressively show more items
  useEffect(() => {
    if (!staggered) return;
    
    // Show 2 items immediately for any device
    let shown = reduced || isLowEndDevice ? 2 : Math.min(2, count);
    setItemsToShow(shown);
    
    // Then gradually add more items
    const interval = setInterval(() => {
      if (shown >= count) {
        clearInterval(interval);
        return;
      }
      
      // Add 1 or 2 items at a time depending on device capability
      shown += isLowEndDevice ? 1 : 2;
      if (shown > count) shown = count;
      
      setItemsToShow(shown);
    }, isLowEndDevice ? 300 : 150);
    
    return () => clearInterval(interval);
  }, [count, staggered, isLowEndDevice, reduced]);
  
  // Simplified skeleton for low-end devices
  if (reduced || isLowEndDevice) {
    return (
      <div className="p-4 space-y-4" data-testid="transaction-skeleton-reduced">
        {Array.from({ length: itemsToShow }).map((_, i) => (
          <div 
            key={i} 
            className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            </div>
            <Skeleton className="h-4 w-[60px]" />
          </div>
        ))}
      </div>
    );
  }
  
  // Enhanced skeleton with staggered animations
  return (
    <div className="p-4 space-y-4" data-testid="transaction-skeleton">
      {Array.from({ length: itemsToShow }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-5 w-[60px] rounded-full" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
