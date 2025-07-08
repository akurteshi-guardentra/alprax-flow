
import { useEffect, useState } from 'react';
import { useNetworkConditions, ConnectionQuality } from './use-network-conditions';
import { useDataSaverMode } from './use-data-saver';
import { usePerformanceMetrics } from './use-performance-metrics';

/**
 * Performance analysis result
 */
export interface PerformanceSummary {
  connectionQuality: ConnectionQuality;
  isDataSaverEnabled: boolean;
  isLowEndDevice: boolean;
  memoryUsage: number | null;
  lastRenderTime: number | null;
  averageRenderTime: number | null;
  frameRate: number | null;
  interactionDelay: number | null;
  performanceScore: number; // 0-100
  advice: string[];
}

/**
 * Hook for testing mobile performance and providing optimization suggestions
 * For development use only - helps diagnose performance problems
 */
export function useMobilePerformanceSummary(componentName: string): PerformanceSummary {
  const { connectionQuality, isDataSaverEnabled } = useNetworkConditions();
  const { isLowEndDevice } = useDataSaverMode();
  const { metrics } = usePerformanceMetrics();
  
  const [frameRate, setFrameRate] = useState<number | null>(null);
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  const [advice, setAdvice] = useState<string[]>([]);
  
  // Measure frame rate
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    let frameCount = 0;
    let lastTimestamp = performance.now();
    let animFrameId: number;
    
    const measureFrameRate = (timestamp: number) => {
      frameCount++;
      
      const elapsed = timestamp - lastTimestamp;
      if (elapsed >= 1000) { // Update every second
        const fps = Math.round((frameCount * 1000) / elapsed);
        setFrameRate(fps);
        frameCount = 0;
        lastTimestamp = timestamp;
      }
      
      animFrameId = requestAnimationFrame(measureFrameRate);
    };
    
    animFrameId = requestAnimationFrame(measureFrameRate);
    
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);
  
  // Calculate performance score and advice
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    let score = 100; // Start with perfect score
    const adviceItems: string[] = [];
    
    // Connection quality (0-20 points)
    if (connectionQuality === 'poor') {
      score -= 20;
      adviceItems.push('Poor network detected. Consider implementing offline support.');
    } else if (connectionQuality === 'moderate') {
      score -= 10;
      adviceItems.push('Moderate network. Optimize image loading and reduce network requests.');
    }
    
    // Data saver (0-10 points)
    if (isDataSaverEnabled) {
      score -= 10;
      adviceItems.push('Data saver enabled. Minimize data usage and avoid prefetching.');
    }
    
    // Low-end device (0-20 points)
    if (isLowEndDevice) {
      score -= 20;
      adviceItems.push('Low-end device detected. Simplify UI and reduce animations.');
    }
    
    // Render time (0-20 points)
    if (metrics.renderTime !== null) {
      if (metrics.renderTime > 50) {
        score -= 20;
        adviceItems.push('Slow render times (>50ms). Consider memoization and code splitting.');
      } else if (metrics.renderTime > 16) {
        score -= 10;
        adviceItems.push('Moderate render times (>16ms). Review component optimization.');
      }
    }
    
    // Memory usage (0-15 points)
    if (metrics.memoryUsage > 0.8) {
      score -= 15;
      adviceItems.push('High memory usage detected. Check for memory leaks.');
    } else if (metrics.memoryUsage > 0.6) {
      score -= 7;
      adviceItems.push('Moderate memory usage. Monitor memory allocation.');
    }
    
    // Frame rate (0-15 points)
    if (frameRate !== null) {
      if (frameRate < 30) {
        score -= 15;
        adviceItems.push('Low frame rate (<30fps). Reduce animations and effects.');
      } else if (frameRate < 50) {
        score -= 7;
        adviceItems.push('Moderate frame rate (<50fps). Optimize animations.');
      }
    }
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    setPerformanceScore(score);
    setAdvice(adviceItems);
  }, [
    connectionQuality,
    isDataSaverEnabled,
    isLowEndDevice,
    metrics.renderTime,
    metrics.memoryUsage,
    frameRate
  ]);
  
  return {
    connectionQuality,
    isDataSaverEnabled,
    isLowEndDevice,
    memoryUsage: metrics.memoryUsage,
    lastRenderTime: metrics.renderTime,
    averageRenderTime: metrics.renderTime,
    frameRate,
    interactionDelay: 0,
    performanceScore,
    advice
  };
}
