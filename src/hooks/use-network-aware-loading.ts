
import { useState, useEffect } from 'react';

export function useNetworkAwareLoading(isLoading: boolean = false) {
  const [networkStatus, setNetworkStatus] = useState<'good' | 'poor' | 'offline'>('good');
  const [isLoadingWithFallback, setIsLoadingWithFallback] = useState(isLoading);
  const [imageQuality, setImageQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [loadingStrategy, setLoadingStrategy] = useState<'eager' | 'lazy' | 'deferred'>('lazy');
  const [prefetchStrategy, setPrefetchStrategy] = useState<'aggressive' | 'conservative' | 'none'>('conservative');

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

  // Transform size based on quality setting
  const getOptimizedImageSize = (originalWidth: number): number => {
    switch (imageQuality) {
      case 'low': return Math.max(Math.floor(originalWidth * 0.5), 48);
      case 'medium': return Math.max(Math.floor(originalWidth * 0.75), 64);
      case 'high': return originalWidth;
    }
  };

  return {
    networkStatus,
    isLoadingWithFallback,
    isOnline: navigator.onLine,
    imageQuality,
    loadingStrategy,
    getOptimizedImageSize
  };
}
