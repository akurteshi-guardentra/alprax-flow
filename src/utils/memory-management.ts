/**
 * Memory management utilities for production
 */

export class MemoryManager {
  private static observers = new Set<PerformanceObserver>();
  private static memoryThreshold = 50 * 1024 * 1024; // 50MB

  static initialize(): void {
    if (typeof window === 'undefined') return;

    // Monitor memory usage
    if ('memory' in performance) {
      this.monitorMemoryUsage();
    }

    // Clean up observers on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Periodic cleanup
    setInterval(() => {
      this.performCleanup();
    }, 60000); // Every minute
  }

  private static monitorMemoryUsage(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            console.debug('Performance measure:', entry.name, entry.duration);
          }
        }
      });

      observer.observe({ entryTypes: ['measure'] });
      this.observers.add(observer);
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }
  }

  static getMemoryInfo(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  static isMemoryPressure(): boolean {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return false;

    return memoryInfo.usedJSHeapSize > this.memoryThreshold;
  }

  private static performCleanup(): void {
    // Clear old caches if memory pressure
    if (this.isMemoryPressure()) {
      console.log('Memory pressure detected, performing cleanup');
      
      // Clear transaction cache
      if ((window as any).transactionCache) {
        (window as any).transactionCache.clearAllCaches();
      }

      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
    }
  }

  static cleanup(): void {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.error('Error disconnecting observer:', error);
      }
    });
    this.observers.clear();
  }
}