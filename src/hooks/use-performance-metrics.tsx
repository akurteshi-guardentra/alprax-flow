import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
  isLowPerformance: boolean;
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 60,
    isLowPerformance: false
  });

  const [frameCount, setFrameCount] = useState(0);
  const [lastFrameTime, setLastFrameTime] = useState(performance.now());

  const measureRenderTime = useCallback((componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const renderTime = end - start;
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        isLowPerformance: renderTime > 16.67 // 60fps threshold
      }));
      
      if (renderTime > 50) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, []);

  const measureFPS = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastFrameTime;
    
    if (deltaTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / deltaTime);
      setMetrics(prev => ({
        ...prev,
        fps,
        isLowPerformance: fps < 45
      }));
      
      setFrameCount(0);
      setLastFrameTime(now);
    } else {
      setFrameCount(prev => prev + 1);
    }
  }, [frameCount, lastFrameTime]);

  useEffect(() => {
    // Memory usage monitoring
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
        }));
      };
      
      const interval = setInterval(updateMemory, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // FPS monitoring
    let animationFrame: number;
    
    const animate = () => {
      measureFPS();
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [measureFPS]);

  return {
    metrics,
    measureRenderTime
  };
}