import { motion } from 'framer-motion';
import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  isVisible: boolean;
  isRefreshing: boolean;
  pullProgress: number;
  pullDistance: number;
  canRefresh: boolean;
}

export function PullToRefreshIndicator({
  isVisible,
  isRefreshing,
  pullProgress,
  pullDistance,
  canRefresh
}: PullToRefreshIndicatorProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center"
      style={{
        transform: `translateY(${Math.min(pullDistance, 100)}px)`,
        height: '80px'
      }}
    >
      <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-black/80 backdrop-blur-sm border border-white/20">
        <motion.div
          animate={{
            rotate: isRefreshing ? 0 : pullProgress * 180,
            scale: Math.max(0.8, Math.min(1.2, pullProgress + 0.8))
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "transition-colors duration-200",
            canRefresh ? "text-green-400" : "text-white/60"
          )}
        >
          {isRefreshing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <ArrowDown className="w-6 h-6" />
          )}
        </motion.div>
        
        <motion.div
          animate={{
            scale: pullProgress,
            opacity: Math.max(0.3, pullProgress)
          }}
          className="text-xs text-white/80 font-medium"
        >
          {isRefreshing ? (
            "Refreshing..."
          ) : canRefresh ? (
            "Release to refresh"
          ) : (
            "Pull to refresh"
          )}
        </motion.div>
        
        {/* Progress indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full"
            animate={{
              width: `${pullProgress * 100}%`
            }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
}