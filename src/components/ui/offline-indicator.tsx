import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  /**
   * Last time data was synced (timestamp)
   */
  lastSyncTime?: number | null;
  
  /**
   * Callback to manually trigger a sync when online
   */
  onRetry?: () => void;
  
  /**
   * Whether there is data being shown from cache
   */
  hasOfflineData?: boolean;
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Whether we're actively trying to reconnect
   */
  isReconnecting?: boolean;
}

/**
 * Component to display when app is offline but showing cached data
 */
export function OfflineIndicator({
  lastSyncTime,
  onRetry,
  hasOfflineData = true,
  className = '',
  isReconnecting = false
}: OfflineIndicatorProps) {
  // Format the last sync time in a user-friendly way
  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Unknown';
    
    const now = Date.now();
    const diffMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };
  
  return (
    <motion.div 
      className={`bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded-r-md ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <WifiOff size={18} className="text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              You're offline
            </p>
            {hasOfflineData && (
              <p className="text-xs text-yellow-700 dark:text-yellow-400/80">
                Showing cached data from {formatLastSync(lastSyncTime)}
              </p>
            )}
          </div>
        </div>
        
        {onRetry && (
          <button 
            onClick={onRetry}
            disabled={isReconnecting}
            className="text-xs px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-300 dark:hover:bg-yellow-600 disabled:opacity-50"
          >
            <span className="flex items-center">
              <RefreshCw size={12} className={`mr-1 ${isReconnecting ? 'animate-spin' : ''}`} />
              {isReconnecting ? 'Connecting...' : 'Retry'}
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
