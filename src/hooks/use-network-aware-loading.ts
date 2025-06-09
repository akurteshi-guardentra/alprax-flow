
import { useState, useEffect } from 'react';

export function useNetworkAwareLoading(isLoading: boolean = false) {
  const [networkStatus, setNetworkStatus] = useState<'good' | 'poor' | 'offline'>('good');
  const [isLoadingWithFallback, setIsLoadingWithFallback] = useState(isLoading);

  useEffect(() => {
    // Monitor network connection
    const updateNetworkStatus = () => {
      if (!navigator.onLine) {
        setNetworkStatus('offline');
      } else {
        // Check connection quality if available
        const connection = (navigator as any).connection;
        if (connection) {
          const effectiveType = connection.effectiveType;
          if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            setNetworkStatus('poor');
          } else {
            setNetworkStatus('good');
          }
        } else {
          setNetworkStatus('good');
        }
      }
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  useEffect(() => {
    setIsLoadingWithFallback(isLoading);
  }, [isLoading]);

  return {
    networkStatus,
    isLoadingWithFallback,
    isOnline: navigator.onLine
  };
}
