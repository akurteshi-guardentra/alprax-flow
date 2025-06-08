import { useState, useEffect } from 'react';

/**
 * Connection quality types
 */
export type ConnectionQuality = 'unknown' | 'poor' | 'moderate' | 'good';

/**
 * Network connection information
 */
export interface NetworkConditions {
  connectionQuality: ConnectionQuality;
  isDataSaverEnabled: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlinkSpeed: number | null;
  rtt: number | null; // Round-trip time in ms
  isOffline: boolean;
  isOnline: boolean; // Convenience property, opposite of isOffline
}

/**
 * Hook for detecting and monitoring network connection conditions
 * Useful for adaptive content loading strategies on mobile
 */
export function useNetworkConditions(): NetworkConditions {  const [networkConditions, setNetworkConditions] = useState<NetworkConditions>({
    connectionQuality: 'unknown',
    isDataSaverEnabled: false,
    connectionType: null,
    effectiveType: null,
    downlinkSpeed: null,
    isOnline: navigator.onLine,
    rtt: null,
    isOffline: !navigator.onLine,
    isOnline: navigator.onLine,
  });

  useEffect(() => {
    // Function to determine connection quality based on available metrics
    const determineConnectionQuality = (): ConnectionQuality => {
      // @ts-ignore - Navigator connection API
      if (!navigator.onLine || (navigator.connection && navigator.connection.saveData)) {
        return 'poor';
      }

      // @ts-ignore - Navigator connection API
      const connection = navigator.connection;
      
      if (!connection) {
        return navigator.onLine ? 'moderate' : 'poor';
      }

      // @ts-ignore
      const { effectiveType, downlink, rtt } = connection;

      // High speed connection
      if (
        (effectiveType === '4g' && downlink >= 2) ||
        (rtt && rtt < 100 && downlink >= 1.5)
      ) {
        return 'good';
      }

      // Medium speed connection
      if (
        effectiveType === '4g' ||
        effectiveType === '3g' && downlink >= 0.7 ||
        (rtt && rtt < 250 && downlink >= 0.5)
      ) {
        return 'moderate';
      }

      // Everything else is considered poor
      return 'poor';
    };

    // Function to update connection state
    const updateConnectionStatus = () => {
      try {
        // Set offline status
        const isOffline = !navigator.onLine;
        const isOnline = navigator.onLine;
        
        // @ts-ignore - Navigator connection API
        if ('connection' in navigator && navigator.connection) {
          // @ts-ignore
          const { effectiveType, type, saveData, downlink, rtt } = navigator.connection;
            setNetworkConditions({
            connectionQuality: determineConnectionQuality(),
            isDataSaverEnabled: !!saveData,
            connectionType: type || null,
            effectiveType: effectiveType || null,
            downlinkSpeed: typeof downlink === 'number' ? downlink : null,
            rtt: typeof rtt === 'number' ? rtt : null,
            isOffline,
            isOnline
          });
        } else {
          // Fallback for browsers without connection API          setNetworkConditions(prev => ({
            ...prev,
            connectionQuality: navigator.onLine ? 'moderate' : 'poor',
            isOffline,
            isOnline
          }));
        }
      } catch (e) {
        console.error('Error detecting network conditions:', e);
      }
    };

    // Initial status check
    updateConnectionStatus();

    // Listen for connection changes
    // @ts-ignore - Navigator connection API
    if ('connection' in navigator && navigator.connection) {
      // @ts-ignore
      if ('addEventListener' in navigator.connection) {
        // @ts-ignore
        navigator.connection.addEventListener('change', updateConnectionStatus);
      }
    }

    // Listen for online/offline events
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    // Cleanup
    return () => {
      // @ts-ignore - Navigator connection API
      if ('connection' in navigator && navigator.connection) {
        // @ts-ignore
        if ('removeEventListener' in navigator.connection) {
          // @ts-ignore
          navigator.connection.removeEventListener('change', updateConnectionStatus);
        }
      }
      
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, []);

  return networkConditions;
}
