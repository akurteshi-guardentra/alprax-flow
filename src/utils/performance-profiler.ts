interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'timing' | 'counter' | 'gauge'
  tags?: Record<string, string>
}

interface ProfilerOptions {
  enabled: boolean
  sampleRate: number
  bufferSize: number
  autoFlush: boolean
}

class PerformanceProfiler {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []
  private options: ProfilerOptions
  private startTime: number

  constructor(options: Partial<ProfilerOptions> = {}) {
    this.options = {
      enabled: true,
      sampleRate: 1.0,
      bufferSize: 1000,
      autoFlush: true,
      ...options
    }
    
    this.startTime = performance.now()
    
    if (this.options.enabled) {
      this.initializeObservers()
    }
  }

  // Record custom timing metric
  timing(name: string, value: number, tags?: Record<string, string>) {
    this.recordMetric({
      name,
      value,
      timestamp: performance.now(),
      type: 'timing',
      tags
    })
  }

  // Record counter metric
  counter(name: string, value: number = 1, tags?: Record<string, string>) {
    this.recordMetric({
      name,
      value,
      timestamp: performance.now(),
      type: 'counter',
      tags
    })
  }

  // Record gauge metric (snapshot value)
  gauge(name: string, value: number, tags?: Record<string, string>) {
    this.recordMetric({
      name,
      value,
      timestamp: performance.now(),
      type: 'gauge',
      tags
    })
  }

  // Get core web vitals
  async getCoreWebVitals(): Promise<Record<string, number>> {
    return new Promise((resolve) => {
      const vitals: Record<string, number> = {}
      
      // Get navigation timing
      if ('getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          vitals.TTFB = navigation.responseStart - navigation.requestStart
          vitals.DOMContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
          vitals.loadComplete = navigation.loadEventEnd - navigation.loadEventStart
        }
      }

      // Get paint timing
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          vitals.FCP = entry.startTime
        }
        if (entry.name === 'largest-contentful-paint') {
          vitals.LCP = entry.startTime
        }
      })

      setTimeout(() => {
        resolve(vitals)
      }, 1000)
    })
  }

  // Get memory usage information
  getMemoryUsage(): Record<string, number> {
    const memory: Record<string, number> = {}
    
    if ('memory' in performance) {
      const perfMemory = (performance as any).memory
      memory.usedJSHeapSize = perfMemory.usedJSHeapSize
      memory.totalJSHeapSize = perfMemory.totalJSHeapSize
      memory.jsHeapSizeLimit = perfMemory.jsHeapSizeLimit
      memory.memoryUsagePercent = (perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit) * 100
    }
    
    return memory
  }

  // Get performance summary
  getPerformanceSummary(): Record<string, any> {
    const now = performance.now()
    const memory = this.getMemoryUsage()
    
    return {
      uptime: now - this.startTime,
      metricsCount: this.metrics.length,
      memory,
      timestamp: Date.now()
    }
  }

  private initializeObservers() {
    if ('PerformanceObserver' in window) {
      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming
          this.timing('resource_load_time', resource.responseEnd - resource.startTime, {
            resource_type: resource.initiatorType,
            resource_name: resource.name.split('/').pop() || 'unknown'
          })
        }
      })
      
      try {
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (e) {
        console.warn('Resource timing observer not supported')
      }
    }
  }

  private recordMetric(metric: PerformanceMetric) {
    // Sample rate check
    if (Math.random() > this.options.sampleRate) {
      return
    }

    this.metrics.push(metric)
    
    // Buffer size check
    if (this.metrics.length > this.options.bufferSize) {
      this.metrics = this.metrics.slice(-this.options.bufferSize)
    }
  }

  // Clean up observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

export const performanceProfiler = new PerformanceProfiler()
export type { PerformanceMetric, ProfilerOptions }