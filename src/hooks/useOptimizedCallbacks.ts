import { useCallback, useMemo } from 'react';

/**
 * Hook for optimizing component re-renders and memoization
 */
export function useOptimizedCallbacks<T extends Record<string, any>>(
  dependencies: T,
  callbacks: Record<string, (...args: any[]) => any>
) {
  const memoizedCallbacks = useMemo(() => {
    const optimizedCallbacks: Record<string, any> = {};
    
    Object.entries(callbacks).forEach(([key, callback]) => {
      optimizedCallbacks[key] = callback;
    });
    
    return optimizedCallbacks;
  }, Object.values(dependencies));
  
  return memoizedCallbacks;
}

/**
 * Debounced callback hook for performance optimization
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: any[] = []
): T {
  return useCallback(
    debounce(callback, delay),
    [delay, ...deps]
  ) as T;
}

/**
 * Throttled callback hook for performance optimization
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: any[] = []
): T {
  return useCallback(
    throttle(callback, delay),
    [delay, ...deps]
  ) as T;
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    }
  };
}