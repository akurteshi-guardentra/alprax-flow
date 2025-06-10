
import { useState, useEffect, useRef, useCallback } from 'react';

interface PerformanceConfig {
  componentName: string;
  trackInteractions?: boolean;
  trackRenders?: boolean;
  trackMemory?: boolean;
  sampleRate?: number;
}

interface PerformanceMetrics {
  lastRenderTime: number | null;
  averageRenderTime: number | null;
  trackInteractionStart: (() => void) | null;
  trackInteractionEnd: (() => void) | null;
  interactionDelay?: number | null;
  memoryUsage?: number | null;
}

export function usePerformanceMetrics(
  enabled: boolean = true,
  config: PerformanceConfig
): PerformanceMetrics {
  const [lastRenderTime, setLastRenderTime] = useState<number | null>(null);
  const [averageRenderTime, setAverageRenderTime] = useState<number | null>(null);
  const [interactionDelay, setInteractionDelay] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const renderTimes = useRef<number[]>([]);
  const interactionStartTime = useRef<number | null>(null);
  
  const trackMemory = config.trackMemory ?? false;
  const trackInteractions = config.trackInteractions ?? false;
  const trackRenders = config.trackRenders ?? false;

  const trackInteractionStart = useCallback(() => {
    if (!enabled || !trackInteractions) return;
    interactionStartTime.current = performance.now();
  }, [enabled, trackInteractions]);

  const trackInteractionEnd = useCallback(() => {
    if (!enabled || !trackInteractions || !interactionStartTime.current) return;
    
    const duration = performance.now() - interactionStartTime.current;
    setInteractionDelay(duration);
    console.log(`${config.componentName} interaction took ${duration.toFixed(2)}ms`);
    interactionStartTime.current = null;
  }, [enabled, trackInteractions, config.componentName]);

  useEffect(() => {
    if (!enabled || !trackRenders) return;

    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      setLastRenderTime(renderTime);
      
      renderTimes.current.push(renderTime);
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }
      
      const average = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;
      setAverageRenderTime(average);
    };
  });

  useEffect(() => {
    if (!enabled || !trackMemory) return;

    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setMemoryUsage(memInfo.usedJSHeapSize / 1024 / 1024); // Convert to MB
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);
    
    return () => clearInterval(interval);
  }, [enabled, trackMemory]);

  return {
    lastRenderTime,
    averageRenderTime,
    trackInteractionStart: trackInteractions ? trackInteractionStart : null,
    trackInteractionEnd: trackInteractions ? trackInteractionEnd : null,
    interactionDelay,
    memoryUsage
  };
}
