import { useState, useCallback, useRef, useEffect } from 'react';

interface UseLazyLoadingOptions {
  initialBatchSize?: number;
  batchIncrement?: number;
  maxItems?: number;
  loadingTriggerDistance?: number;
}

/**
 * A hook for lazy loading items in a list as the user scrolls
 * Optimized for handling large transaction lists on mobile
 */
export function useLazyLoading<T>(
  items: T[],
  {
    initialBatchSize = 20,
    batchIncrement = 10,
    maxItems = 100,
    loadingTriggerDistance = 300
  }: UseLazyLoadingOptions = {}
) {
  // Try to detect data saver mode for smarter batch sizing
  const [isDataSaver, setIsDataSaver] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  
  // Adjust batch sizes based on device capabilities
  const effectiveInitialBatch = isDataSaver || isLowEndDevice 
    ? Math.min(initialBatchSize, 10) // Smaller initial batch for data saving
    : initialBatchSize;
    
  const effectiveBatchIncrement = isDataSaver || isLowEndDevice
    ? Math.min(batchIncrement, 5) // Smaller increments for data saving 
    : batchIncrement;
  
  const [visibleCount, setVisibleCount] = useState(effectiveInitialBatch);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  
  // Detect data saver and device capabilities
  useEffect(() => {
    try {
      // Check for data saver mode
      // @ts-ignore - Navigator connection API
      if ('connection' in navigator && navigator.connection) {
        // @ts-ignore
        const { saveData, effectiveType, deviceMemory } = navigator.connection;
        setIsDataSaver(!!saveData);
        
        // Check for low-end device
        const isSlowConnection = effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g';
        const isLowMemory = deviceMemory && deviceMemory < 4;  // Less than 4GB RAM
        const isLowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;  // Less than quad core
        
        setIsLowEndDevice(isSlowConnection || isLowMemory || isLowCPU);
      }
    } catch (e) {
      console.error('Error detecting device capabilities:', e);
    }
  }, []);
  
  // Get the currently visible items
  const visibleItems = items?.slice(0, Math.min(visibleCount, items?.length || 0)) || [];
    // Load more items when triggered
  const loadMore = useCallback(() => {
    if (!hasMore) return;
    
    const nextVisibleCount = visibleCount + (isDataSaver || isLowEndDevice ? effectiveBatchIncrement : batchIncrement);
    setVisibleCount(nextVisibleCount);
    
    // Check if we've reached the maximum or end of items
    if (nextVisibleCount >= maxItems || nextVisibleCount >= (items?.length || 0)) {
      setHasMore(false);
    }
  }, [visibleCount, batchIncrement, effectiveBatchIncrement, hasMore, items, maxItems, isDataSaver, isLowEndDevice]);
    // Reset if items array changes
  useEffect(() => {
    setVisibleCount(isDataSaver || isLowEndDevice ? effectiveInitialBatch : initialBatchSize);
    setHasMore((items?.length || 0) > (isDataSaver || isLowEndDevice ? effectiveInitialBatch : initialBatchSize));
  }, [items, initialBatchSize, effectiveInitialBatch, isDataSaver, isLowEndDevice]);
  
  // Setup intersection observer to detect when user scrolls near the bottom
  useEffect(() => {
    if (!loadingRef.current || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: `0px 0px ${loadingTriggerDistance}px 0px`,
        threshold: 0.1
      }
    );
    
    observer.observe(loadingRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [loadMore, hasMore, loadingTriggerDistance]);
  
  // Connect to a scroll container (should be the scrollable parent)
  const connectScrollContainer = useCallback((element: HTMLElement | null) => {
    scrollContainerRef.current = element;
  }, []);
  
  return {
    visibleItems,
    loadingRef,
    hasMore,
    loadMore,
    connectScrollContainer
  };
}
