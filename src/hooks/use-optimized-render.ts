import { useCallback, useMemo, useRef, useEffect } from 'react';

// Simple debounce implementation to avoid lodash dependency
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

// Hook to prevent unnecessary re-renders
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// Memoize expensive calculations
export function useExpensiveCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(() => {
    console.log('Expensive calculation running...');
    const start = performance.now();
    const result = calculation();
    const duration = performance.now() - start;
    
    if (duration > 5) {
      console.warn(`Expensive calculation took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }, dependencies);
}

// Debounced state updates
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );

  return debouncedCallback as T;
}

// Optimize component props comparison
export function useShallowMemo<T extends Record<string, any>>(obj: T): T {
  return useMemo(() => obj, Object.values(obj));
}

// Track render performance
export function useRenderTracker(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  renderCount.current += 1;
  const currentTime = performance.now();
  const timeSinceLastRender = currentTime - lastRenderTime.current;
  lastRenderTime.current = currentTime;

  if (process.env.NODE_ENV === 'development') {
    console.log(`${componentName} render #${renderCount.current} (+${timeSinceLastRender.toFixed(2)}ms)`);
  }

  return {
    renderCount: renderCount.current,
    timeSinceLastRender
  };
}