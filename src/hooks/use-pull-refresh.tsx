import { useState, useEffect, useRef, useCallback } from 'react';
import { hapticFeedback } from '@/lib/haptics';

interface PullRefreshOptions {
  threshold?: number;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
  refreshingTimeout?: number;
}

export function usePullRefresh({
  threshold = 80,
  onRefresh,
  disabled = false,
  refreshingTimeout = 2000
}: PullRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);

  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    // Only start pull refresh if at the top of the container
    const isAtTop = container.scrollTop === 0;
    setCanPull(isAtTop);

    if (isAtTop) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || !canPull || disabled || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    
    // Add resistance to the pull
    const resistanceFactor = 0.5;
    const adjustedDistance = distance * resistanceFactor;
    
    setPullDistance(adjustedDistance);

    // Provide haptic feedback when reaching threshold
    if (adjustedDistance >= threshold && pullDistance < threshold) {
      hapticFeedback('medium');
    }

    // Prevent default scrolling when pulling
    if (distance > 0) {
      e.preventDefault();
    }
  }, [isPulling, canPull, disabled, isRefreshing, threshold, pullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || !canPull || disabled || isRefreshing) return;

    const shouldRefresh = pullDistance >= threshold;

    if (shouldRefresh) {
      setIsRefreshing(true);
      hapticFeedback('success');

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull refresh error:', error);
        hapticFeedback('error');
      }

      // Add minimum refresh time for better UX
      setTimeout(() => {
        setIsRefreshing(false);
      }, Math.max(500, refreshingTimeout));
    }

    setIsPulling(false);
    setPullDistance(0);
    setCanPull(false);
  }, [isPulling, canPull, disabled, isRefreshing, pullDistance, threshold, onRefresh, refreshingTimeout]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldShowRefreshIndicator = isPulling || isRefreshing;

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    pullProgress,
    shouldShowRefreshIndicator,
    canRefresh: pullDistance >= threshold
  };
}