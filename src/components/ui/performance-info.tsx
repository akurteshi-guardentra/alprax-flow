import React from 'react';
import { useNetworkConditions } from '@/hooks/use-network-conditions';
import { useDataSaverMode } from '@/hooks/use-data-saver';
import { Wifi, WifiOff, AlertCircle, Download, Upload, Clock } from 'lucide-react';

interface PerformanceInfoProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * Development-only component that shows network and performance information
 * Useful for debugging performance issues on mobile devices
 */
export function PerformanceInfo({ 
  className = '', 
  showDetails = false 
}: PerformanceInfoProps) {
  // Only show in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const { connectionQuality, effectiveType, downlinkSpeed, rtt, isOffline } = useNetworkConditions();
  const { isDataSaverEnabled, isLowEndDevice } = useDataSaverMode();
  
  // Get connection quality indicator
  const getConnectionIcon = () => {
    if (isOffline) return <WifiOff className="h-4 w-4 text-destructive" />;
    
    switch (connectionQuality) {
      case 'good':
        return <Wifi className="h-4 w-4 text-success" />;
      case 'moderate':
        return <Wifi className="h-4 w-4 text-warning" />;
      case 'poor':
        return <Wifi className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };
  
  // Get basic connection quality label
  const getConnectionLabel = () => {
    if (isOffline) return 'Offline';
    return `${connectionQuality.charAt(0).toUpperCase()}${connectionQuality.slice(1)}`;
  };
  
  if (!showDetails) {
    // Simple version with just the icon and quality
    return (
      <div className={`text-xs flex items-center gap-1 ${className}`}>
        {getConnectionIcon()}
        <span>{getConnectionLabel()}</span>
        {isDataSaverEnabled && <span className="text-info text-xs">DS</span>}
        {isLowEndDevice && <span className="text-warning text-xs">LE</span>}
      </div>
    );
  }
  
  // Detailed version with all network info
  return (
    <div className={`text-xs rounded border border-gray-200 dark:border-gray-800 p-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1 font-medium">
          {getConnectionIcon()}
          <span>{getConnectionLabel()}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {effectiveType && <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{effectiveType}</span>}
          {isDataSaverEnabled && <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">Data Saver</span>}
          {isLowEndDevice && <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">Low-End</span>}
        </div>
      </div>
      
      {showDetails && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-gray-600 dark:text-gray-400">
          {downlinkSpeed !== null && (
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{downlinkSpeed.toFixed(1)} Mbps</span>
            </div>
          )}
          
          {rtt !== null && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{rtt} ms</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
