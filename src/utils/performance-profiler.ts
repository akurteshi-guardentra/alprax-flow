/**
 * Performance profiler utility for tracking application performance
 */

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  type: 'render' | 'navigation' | 'api' | 'custom';
}

class PerformanceProfiler {
  private entries: PerformanceEntry[] = [];
  private maxEntries = 100;

  startMeasure(name: string, type: PerformanceEntry['type'] = 'custom'): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.addEntry({ name, startTime, duration, type });
    };
  }

  addEntry(entry: PerformanceEntry) {
    this.entries.push(entry);
    
    // Keep only recent entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    // Log slow operations
    if (entry.duration > 100) {
      console.warn(`Slow ${entry.type}: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
    }
  }

  getSlowOperations(threshold = 50): PerformanceEntry[] {
    return this.entries.filter(entry => entry.duration > threshold);
  }

  getAverageByType(type: PerformanceEntry['type']): number {
    const typeEntries = this.entries.filter(entry => entry.type === type);
    if (typeEntries.length === 0) return 0;
    
    const total = typeEntries.reduce((sum, entry) => sum + entry.duration, 0);
    return total / typeEntries.length;
  }

  clear() {
    this.entries = [];
  }

  exportData() {
    return {
      entries: this.entries,
      summary: {
        total: this.entries.length,
        averageRender: this.getAverageByType('render'),
        averageNavigation: this.getAverageByType('navigation'),
        averageApi: this.getAverageByType('api'),
        slowOperations: this.getSlowOperations()
      }
    };
  }
}

export const performanceProfiler = new PerformanceProfiler();

// Utility functions
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  type: PerformanceEntry['type'] = 'custom'
): T {
  return ((...args: any[]) => {
    const endMeasure = performanceProfiler.startMeasure(name, type);
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.finally(endMeasure);
      }
      endMeasure();
      return result;
    } catch (error) {
      endMeasure();
      throw error;
    }
  }) as T;
}

export function measureAsync<T>(
  asyncFn: () => Promise<T>,
  name: string,
  type: PerformanceEntry['type'] = 'custom'
): Promise<T> {
  const endMeasure = performanceProfiler.startMeasure(name, type);
  return asyncFn().finally(endMeasure);
}
