import { useState, useEffect, useCallback, useRef } from 'react';

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

  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());

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
    // FPS monitoring with refs to avoid dependency issues
    let animationFrame: number;
    
    const animate = () => {
      const now = performance.now();
      const deltaTime = now - lastFrameTimeRef.current;
      
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        setMetrics(prev => ({
          ...prev,
          fps,
          isLowPerformance: fps < 45
        }));
        
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      } else {
        frameCountRef.current += 1;
      }
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, []); // Empty dependency array to prevent re-renders

  return {
    metrics,
    measureRenderTime
  };
}