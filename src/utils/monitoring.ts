import { logger } from './logger'

export class Monitor {
  private errorCounts: Map<string, number> = new Map()
  private performanceMetrics: Map<string, number[]> = new Map()
  private isInitialized = false

  initialize() {
    if (this.isInitialized) return
    
    this.setupErrorTracking()
    this.setupPerformanceTracking()
    this.isInitialized = true
    
    logger.info('Monitor initialized')
  }

  private setupErrorTracking() {
    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    // Track promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(event.reason), {
        type: 'unhandled_promise_rejection'
      })
    })
  }

  private setupPerformanceTracking() {
    // Track navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.logPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart)
        this.logPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart)
      }
    })
  }

  logError(error: Error, context?: Record<string, any>) {
    const errorKey = `${error.name}:${error.message}`
    const count = this.errorCounts.get(errorKey) || 0
    this.errorCounts.set(errorKey, count + 1)
    
    logger.error('Application error', {
      metadata: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        count: count + 1,
        ...context
      }
    })
  }

  logPerformance(metric: string, value: number) {
    const metrics = this.performanceMetrics.get(metric) || []
    metrics.push(value)
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift()
    }
    
    this.performanceMetrics.set(metric, metrics)
    
    logger.info('Performance metric', {
      metric,
      value,
      metadata: {
        average: metrics.reduce((a, b) => a + b, 0) / metrics.length
      }
    })
  }

  getErrorReport() {
    return Object.fromEntries(this.errorCounts)
  }

  getPerformanceReport() {
    const report: Record<string, any> = {}
    
    for (const [metric, values] of this.performanceMetrics.entries()) {
      report[metric] = {
        current: values[values.length - 1],
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      }
    }
    
    return report
  }

  getSystemHealth() {
    return {
      errors: this.getErrorReport(),
      performance: this.getPerformanceReport(),
      timestamp: new Date().toISOString()
    }
  }

  cleanup() {
    this.errorCounts.clear()
    this.performanceMetrics.clear()
  }
}

export const monitor = new Monitor()
