import { useEffect, useState, useRef } from 'react';

export function useWelcomePerformance() {
  const [isHighPerformanceDevice, setIsHighPerformanceDevice] = useState(true);
  const perfMarksRef = useRef<{ [key: string]: number }>({});
  
  useEffect(() => {
    // Detect device capabilities for feature adjustments
    const detectPerformance = () => {
      // Check if device has limited memory
      const limitedMemory = 
        'deviceMemory' in navigator && 
        // @ts-ignore - deviceMemory is not in TS standard lib
        (navigator.deviceMemory as number) < 4;
      
      // Check if device has reduced motion preference
      const prefersReducedMotion = 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Check for low power mode on iOS (indirect detection)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const possibleLowPower = isIOS && window.devicePixelRatio === 1;
      
      // Mark as low performance if any condition is true
      setIsHighPerformanceDevice(
        !limitedMemory && !prefersReducedMotion && !possibleLowPower
      );
      
      // Log performance markers
      perfMarksRef.current.initialDetection = performance.now();
      console.log('Performance mode:', isHighPerformanceDevice ? 'High' : 'Low');
    };
    
    detectPerformance();
    
    // Set up framerate monitoring
    let frameCount = 0;
    let lastTime = performance.now();
    let frameRate = 60;
    let lowFrameRateCount = 0;
    
    const checkFrameRate = () => {
      frameCount++;
      const now = performance.now();
      
      // Calculate FPS every second
      if (now - lastTime >= 1000) {
        frameRate = frameCount;
        frameCount = 0;
        lastTime = now;
        
        console.log('Frame rate:', frameRate);
        
        // If frame rate drops below threshold multiple times,
        // adjust to low performance mode
        if (frameRate < 30) {
          lowFrameRateCount++;
          if (lowFrameRateCount >= 3 && isHighPerformanceDevice) {
            setIsHighPerformanceDevice(false);
            console.log('Switching to low performance mode due to low frame rate');
          }
        } else {
          lowFrameRateCount = Math.max(0, lowFrameRateCount - 1);
        }
      }
      
      animationFrameId = requestAnimationFrame(checkFrameRate);
    };
    
    let animationFrameId = requestAnimationFrame(checkFrameRate);
    
    // Track main metrics
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);
  
  // Mark timings for performance debugging
  const markPerformanceTimestamp = (name: string) => {
    perfMarksRef.current[name] = performance.now();
  };

  // Track page load metrics
  const trackPageLoad = () => {
    const loadTime = performance.now();
    perfMarksRef.current.pageLoad = loadTime;
    console.log('Page load tracked:', loadTime);
    
    // Mark additional page load metrics
    markPerformanceTimestamp('welcome-page-load');
  };

  // Track user interactions
  const trackUserInteraction = (action: string) => {
    const interactionTime = performance.now();
    perfMarksRef.current[`interaction-${action}`] = interactionTime;
    console.log('User interaction tracked:', action, interactionTime);
    
    // Mark the specific interaction
    markPerformanceTimestamp(`user-interaction-${action}`);
  };

  return {
    isHighPerformanceDevice,
    markPerformanceTimestamp,
    trackPageLoad,
    trackUserInteraction
  };
}
