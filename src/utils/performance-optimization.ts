import { useCallback, useRef, useMemo } from 'react'

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  let previous = 0

  return function (...args: Parameters<T>) {
    const now = Date.now()
    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(this, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(this, args)
      }, remaining)
    }
  }
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    const callNow = immediate && !timeout

    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func.apply(this, args)
  }
}

// React hook for throttling callbacks
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef(throttle(callback, delay))
  
  return useCallback((...args: Parameters<T>) => {
    return throttledCallback.current(...args)
  }, []) as T
}

// React hook for debouncing callbacks
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useRef(debounce(callback, delay))
  
  return useCallback((...args: Parameters<T>) => {
    return debouncedCallback.current(...args)
  }, []) as T
}

// Hook to optimize expensive calculations
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList | undefined,
  isExpensive: boolean = true
): T {
  return useMemo(() => {
    if (!isExpensive) return factory()
    
    const start = performance.now()
    const result = factory()
    const end = performance.now()
    
    if (end - start > 16) { // More than one frame
      console.warn(`Expensive calculation detected: ${end - start}ms`)
    }
    
    return result
  }, deps)
}

// Performance monitoring for component renders
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(performance.now())
  
  renderCount.current += 1
  
  const currentTime = performance.now()
  const timeSinceLastRender = currentTime - lastRenderTime.current
  lastRenderTime.current = currentTime
  
  // Log slow renders (more than 16ms)
  if (timeSinceLastRender > 16 && renderCount.current > 1) {
    console.warn(
      `Slow render detected in ${componentName}: ${timeSinceLastRender.toFixed(2)}ms`
    )
  }
  
  return {
    renderCount: renderCount.current,
    timeSinceLastRender
  }
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      if (memory && typeof memory === 'object') {
        const usedMB = memory.usedJSHeapSize / 1024 / 1024
        const totalMB = memory.totalJSHeapSize / 1024 / 1024
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024
        
        const usage = (usedMB / limitMB) * 100
        
        if (usage > 70) {
          console.warn(`High memory usage detected: ${usage.toFixed(1)}%`)
        }
        
        return {
          used: usedMB,
          total: totalMB,
          limit: limitMB,
          percentage: usage
        }
      }
    }
    
    return null
  }, [])
  
  return { checkMemoryUsage }
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') && !resource.name.includes('node_modules')
    )
    
    const totalSize = jsResources.reduce((total, resource) => {
      return total + (resource.transferSize || 0)
    }, 0)
    
    const totalSizeMB = totalSize / 1024 / 1024
    
    if (totalSizeMB > 2) {
      console.warn(`Large bundle detected: ${totalSizeMB.toFixed(2)}MB`)
    }
    
    return {
      totalSize: totalSizeMB,
      resources: jsResources.length
    }
  }
  
  return null
}