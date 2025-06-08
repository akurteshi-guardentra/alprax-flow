/**
 * Lightweight performance profiling utilities that can be used throughout the app
 * to measure and optimize performance without adding significant overhead
 */

/**
 * Performance measurement point
 */
interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Simple performance profiler that can be used to measure
 * function execution times and other performance metrics
 */
class PerformanceProfiler {
  private marks: Map<string, PerformanceMark> = new Map();
  private isDevelopment: boolean;
  
  constructor() {
    // Only fully active in development
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }
  
  /**
   * Start measuring performance for a named operation
   * @param name Unique name for this performance measurement
   * @param metadata Additional contextual data
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.isDevelopment) return;
    
    const startTime = performance.now();
    this.marks.set(name, { name, startTime, metadata });
    
    // Also use the browser's built-in performance API if available
    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark(`${name}-start`);
      } catch (e) {
        // Ignore errors from browser's performance API
      }
    }
  }
  
  /**
   * End measuring performance for a named operation
   * @param name Name of the performance measurement to end
   * @returns The duration in milliseconds, or undefined if measurement wasn't started
   */
  end(name: string): number | undefined {
    if (!this.isDevelopment) return;
    
    const mark = this.marks.get(name);
    if (!mark) return undefined;
    
    const endTime = performance.now();
    const duration = endTime - mark.startTime;
    
    // Update the mark with end time and duration
    mark.endTime = endTime;
    mark.duration = duration;
    
    // Also use the browser's built-in performance API if available
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      try {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      } catch (e) {
        // Ignore errors from browser's performance API
      }
    }
    
    // Log the performance measurement in development
    if (this.isDevelopment) {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`, mark.metadata || '');
    }
    
    return duration;
  }
  
  /**
   * Measure the execution time of a function
   * @param name Name for this performance measurement
   * @param fn Function to measure
   * @param metadata Additional contextual data
   * @returns The result of the function
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.start(name, metadata);
    try {
      return fn();
    } finally {
      this.end(name);
    }
  }
  
  /**
   * Measure the execution time of an async function
   * @param name Name for this performance measurement
   * @param fn Async function to measure
   * @param metadata Additional contextual data
   * @returns Promise resolving to the function result
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.start(name, metadata);
    try {
      return await fn();
    } finally {
      this.end(name);
    }
  }
  
  /**
   * Get all completed measurements
   */
  getCompletedMeasurements(): PerformanceMark[] {
    return Array.from(this.marks.values())
      .filter(mark => mark.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));
  }
  
  /**
   * Clear all measurements
   */
  clear(): void {
    this.marks.clear();
    
    // Also clear browser's performance entries if available
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      try {
        performance.clearMarks();
        performance.clearMeasures();
      } catch (e) {
        // Ignore errors from browser's performance API
      }
    }
  }
}

// Create a global instance for easy access
export const profiler = new PerformanceProfiler();

/**
 * Higher-order function to profile a component's render performance
 * @param Component The React component to profile
 * @param componentName Name to use in performance reports
 */
export function withProfiling<P>(
  Component: React.ComponentType<P>,
  componentName: string = Component.displayName || Component.name || 'UnnamedComponent'
): React.FC<P> {
  // Only apply in development
  if (process.env.NODE_ENV !== 'development') {
    return Component as React.FC<P>;
  }
  
  const ProfiledComponent: React.FC<P> = (props: P) => {
    const renderName = `render-${componentName}`;
    profiler.start(renderName);
    
    try {
      return <Component {...props} />;
    } finally {
      // We need to defer end() to capture actual render time
      setTimeout(() => profiler.end(renderName), 0);
    }
  };
  
  ProfiledComponent.displayName = `Profiled(${componentName})`;
  return ProfiledComponent;
}

/**
 * Create a profiler that tracks a specific component or feature area
 * @param namespace Namespace for this profiler
 */
export function createProfiler(namespace: string) {
  return {
    start: (name: string, metadata?: Record<string, any>) => 
      profiler.start(`${namespace}:${name}`, metadata),
    end: (name: string) => 
      profiler.end(`${namespace}:${name}`),
    measure: <T>(name: string, fn: () => T, metadata?: Record<string, any>) =>
      profiler.measure(`${namespace}:${name}`, fn, metadata),
    measureAsync: <T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>) =>
      profiler.measureAsync(`${namespace}:${name}`, fn, metadata)
  };
}
