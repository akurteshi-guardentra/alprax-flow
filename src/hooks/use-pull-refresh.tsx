import { useState, useEffect, useRef, RefObject } from 'react';
import { hapticFeedback } from '@/lib/haptics';

interface PullToRefreshOptions {
  pullDistance?: number; // The distance in pixels required to trigger a refresh
  maxPullDistance?: number; // Maximum distance for visual feedback
  onRefresh: () => Promise<any>; // Function to call when refresh is triggered
  disabled?: boolean; // Whether the pull to refresh is disabled
}

interface PullToRefreshState {
  isPulling: boolean;
  pullProgress: number; // Value between 0 and 1 representing pull progress
  isRefreshing: boolean; 
}

export function usePullToRefresh(
  elementRef: RefObject<HTMLElement>,
  options: PullToRefreshOptions
): PullToRefreshState {
  const {
    pullDistance = 80,
    maxPullDistance = 120,
    onRefresh,
    disabled = false
  } = options;
  
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  
  useEffect(() => {
    if (!elementRef.current || disabled) return;
    
    const element = elementRef.current;
    
    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull to refresh when scrolled to top
      if (element.scrollTop > 0) return;
      
      startY.current = e.touches[0].clientY;
      currentY.current = startY.current;
      
      setIsPulling(true);
      setPullProgress(0);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      currentY.current = e.touches[0].clientY;
      const pullDistance = Math.max(0, currentY.current - startY.current);
      
      // Use a logarithmic function to create resistance as user pulls further
      const progress = Math.min(1, Math.log10(1 + pullDistance) / Math.log10(1 + maxPullDistance));
      setPullProgress(progress);
      
      // Prevent default scrolling when pulling
      if (element.scrollTop === 0 && pullDistance > 5) {
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      setIsPulling(false);
      
      const pullDistance = Math.max(0, currentY.current - startY.current);
      
      // If pulled enough, trigger refresh
      if (pullDistance >= options.pullDistance) {
        setIsRefreshing(true);
        hapticFeedback('medium'); // Give haptic feedback when refresh starts
        
        try {
          await onRefresh();
          hapticFeedback('success'); // Success feedback
        } catch (error) {
          hapticFeedback('error'); // Error feedback
          console.error('Pull to refresh error:', error);
        } finally {
          setIsRefreshing(false);
          setPullProgress(0);
        }
      } else {
        // Reset if not pulled enough
        setPullProgress(0);
      }
    };
    
    // Add passive: false to allow preventDefault in touchmove
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, isPulling, pullDistance, maxPullDistance, onRefresh, disabled]);
  
  return {
    isPulling,
    pullProgress,
    isRefreshing
  };
}
