import { useEffect, useState, useRef } from 'react';

/**
 * Hook for measuring mobile component performance
 * Helps track rendering and interaction metrics to optimize UX
 */
export function usePerformanceMetrics(
  enabled: boolean = true,
  options: {
    componentName: string;
    trackInteractions?: boolean;
    trackRenders?: boolean;
    trackMemory?: boolean;
    samplingRate?: number; // 0-1, percentage of renders to measure
  } = { componentName: 'Unknown' }
) {
  const { 
    componentName, 
    trackInteractions = true, 
    trackRenders = true, 
    trackMemory = false,
    samplingRate = 1 // Default to measuring every render
  } = options;
  
  const [lastRenderTime, setLastRenderTime] = useState<number | null>(null);
  const [averageRenderTime, setAverageRenderTime] = useState<number | null>(null);
  const [interactionDelay, setInteractionDelay] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  
  const renderStartTime = useRef<number | null>(null);
  const renderCount = useRef(0);
  const totalRenderTime = useRef(0);
  const interactionStartTime = useRef<number | null>(null);
    // Function to track when an interaction starts
  const trackInteractionStart = () => {
    if (!enabled || !trackInteractions) return;
    try {
      interactionStartTime.current = performance.now();
    } catch (e) {
      console.error('Failed to track interaction start:', e);
    }
  };
  
  // Function to track when an interaction completes
  const trackInteractionEnd = () => {
    if (!enabled || !trackInteractions) return;
    try {
      if (interactionStartTime.current === null) return;
      
      const endTime = performance.now();
      const delay = endTime - interactionStartTime.current;
      setInteractionDelay(delay);
      
      // Log slow interactions (over 100ms)
      if (delay > 100) {
        console.warn(
          `[Performance] Slow interaction in ${componentName}: ${Math.round(delay)}ms`
        );
      }
      
      interactionStartTime.current = null;
    } catch (e) {
      console.error('Failed to track interaction end:', e);
    }
  };
  
  // Measure render time
  useEffect(() => {
    if (!enabled || !trackRenders) return;
    
    // Only sample renders based on sampling rate
    if (Math.random() > samplingRate) return;
    
    renderStartTime.current = performance.now();
    
    return () => {
      if (renderStartTime.current === null) return;
      
      const renderTime = performance.now() - renderStartTime.current;
      renderCount.current += 1;
      totalRenderTime.current += renderTime;
      setLastRenderTime(renderTime);
      setAverageRenderTime(totalRenderTime.current / renderCount.current);
      
      // Log slow renders (over 16ms)
      if (renderTime > 16) {
        console.warn(
          `[Performance] Slow render in ${componentName}: ${Math.round(renderTime)}ms`
        );
      }
    };
  });
  
  // Track memory usage if requested
  useEffect(() => {
    if (!enabled || !trackMemory) return;
    
    // Memory usage tracking (only available in Chrome)
    const trackMemory = () => {
      try {
        // @ts-ignore - Non-standard API
        if (performance.memory) {
          // @ts-ignore
          const { usedJSHeapSize } = performance.memory;
          setMemoryUsage(usedJSHeapSize / (1024 * 1024)); // Convert to MB
        }
      } catch (e) {
        // Memory API not available
      }
    };
    
    // Track every 5 seconds
    trackMemory();
    const interval = setInterval(trackMemory, 5000);
    
    return () => clearInterval(interval);
  }, [enabled, trackMemory]);
  
  return {
    lastRenderTime,
    averageRenderTime,
    interactionDelay,
    renderCount: renderCount.current,
    memoryUsage,
    trackInteractionStart,
    trackInteractionEnd
  };
}
