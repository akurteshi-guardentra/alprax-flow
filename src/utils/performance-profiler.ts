
/**
 * Performance profiler utility for tracking application performance
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceProfiler {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  startMetric(name: string): void {
    if (!this.isEnabled) return;
    
    this.metrics.set(name, {
      name,
      startTime: performance.now()
    });
  }

  endMetric(name: string): number | null {
    if (!this.isEnabled) return null;
    
    const metric = this.metrics.get(name);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    this.metrics.set(name, {
      ...metric,
      endTime,
      duration
    });

    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceProfiler = new PerformanceProfiler();

// Helper functions for common use cases
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  performanceProfiler.startMetric(name);
  try {
    const result = await fn();
    performanceProfiler.endMetric(name);
    return result;
  } catch (error) {
    performanceProfiler.endMetric(name);
    throw error;
  }
};

export const measureSync = <T>(name: string, fn: () => T): T => {
  performanceProfiler.startMetric(name);
  try {
    const result = fn();
    performanceProfiler.endMetric(name);
    return result;
  } catch (error) {
    performanceProfiler.endMetric(name);
    throw error;
  }
};
