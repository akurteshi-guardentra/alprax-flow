import { useState, useEffect } from 'react';
import { useNetworkConditions } from './use-network-conditions';
import { useDataSaverMode } from './use-data-saver';

/**
 * Hook to provide network-aware resource loading strategies
 * This combines network condition detection with data saver preferences
 * to optimize resource loading strategies
 */
export function useNetworkAwareLoading() {
  const { 
    effectiveConnectionType, 
    downlink,
    rtt, 
    isOnline 
  } = useNetworkConditions();
  
  const { isDataSaverEnabled, isLowEndDevice } = useDataSaverMode();
  
  const [imageQuality, setImageQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [loadingStrategy, setLoadingStrategy] = useState<'eager' | 'lazy' | 'deferred'>('lazy');
  const [prefetchStrategy, setPrefetchStrategy] = useState<'aggressive' | 'conservative' | 'none'>('conservative');
  
  // Determine optimal loading strategies based on network and device
  useEffect(() => {
    // Data saver enabled always takes precedence
    if (isDataSaverEnabled) {
      setImageQuality('low');
      setLoadingStrategy('deferred');
      setPrefetchStrategy('none');
      return;
    }
    
    // Low-end device with any connection issues
    if (isLowEndDevice && (effectiveConnectionType !== '4g' || rtt > 200)) {
      setImageQuality('low');
      setLoadingStrategy('lazy');
      setPrefetchStrategy('none');
      return;
    }
    
    // Network-based decisions
    switch (effectiveConnectionType) {
      case '4g':
        setImageQuality(isLowEndDevice ? 'medium' : 'high');
        setLoadingStrategy('lazy');
        setPrefetchStrategy('conservative');
        break;
      case '3g':
        setImageQuality('medium');
        setLoadingStrategy('lazy');
        setPrefetchStrategy('none');
        break;
      case '2g':
      case 'slow-2g':
        setImageQuality('low');
        setLoadingStrategy('deferred');
        setPrefetchStrategy('none');
        break;
      default:
        // If connection type is unknown, base on downlink speed
        if (downlink && downlink >= 2.0) {
          setImageQuality('high');
          setLoadingStrategy('lazy');
          setPrefetchStrategy('conservative');
        } else if (downlink && downlink >= 0.5) {
          setImageQuality('medium');
          setLoadingStrategy('lazy');
          setPrefetchStrategy('none');
        } else {
          setImageQuality('low');
          setLoadingStrategy('deferred');
          setPrefetchStrategy('none');
        }
    }
  }, [effectiveConnectionType, downlink, rtt, isDataSaverEnabled, isLowEndDevice, isOnline]);
  
  // Transform size based on quality setting
  const getOptimizedImageSize = (originalWidth: number): number => {
    switch (imageQuality) {
      case 'low': return Math.max(Math.floor(originalWidth * 0.5), 48);
      case 'medium': return Math.max(Math.floor(originalWidth * 0.75), 64);
      case 'high': return originalWidth;
    }
  };
  
  // Calculate optimal image format based on network conditions
  const getOptimalImageFormat = (): 'webp' | 'avif' | 'original' => {
    // For extremely slow connections or data saver, use smallest format
    if (isDataSaverEnabled || effectiveConnectionType === 'slow-2g') {
      return 'webp'; // WebP generally has best compression to quality ratio
    }
    
    // For reasonable connections, use AVIF for best quality/compression
    if (effectiveConnectionType === '4g' || effectiveConnectionType === '3g') {
      return 'avif';
    }
    
    // Default to original format if unable to determine
    return 'original';
  };

  return {
    imageQuality,
    loadingStrategy,
    prefetchStrategy,
    isOnline,
    getOptimizedImageSize,
    getOptimalImageFormat,
    // Raw values for custom logic
    effectiveConnectionType,
    downlink,
    rtt,
    isDataSaverEnabled,
    isLowEndDevice
  };
}
