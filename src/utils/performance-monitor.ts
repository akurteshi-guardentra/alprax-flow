import { logger } from './logger'

export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  initialize() {
    this.setupNavigationTiming()
    this.setupResourceTiming()
    this.setupLargestContentfulPaint()
    this.setupFirstInputDelay()
  }

  startMeasure(name: string): void {
    this.metrics.set(name, performance.now())
  }

  endMeasure(name: string): number {
    const startTime = this.metrics.get(name)
    if (!startTime) {
      logger.warn('Performance measure not found', { metadata: { name } })
      return 0
    }

    const duration = performance.now() - startTime
    this.metrics.delete(name)
    
    logger.info('Performance measure', { metadata: { measureName: name, duration } })
    return duration
  }

  private setupNavigationTiming() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          const metrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstByte: navigation.responseStart - navigation.requestStart,
            domInteractive: navigation.domInteractive - navigation.fetchStart
          }
          
          logger.info('Navigation timing', { metrics })
        }
      })
    }
  }

  private setupResourceTiming() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 1000) { // Log slow resources
            logger.warn('Slow resource', {
              metadata: {
                resourceName: entry.name,
                duration: entry.duration,
                transferSize: (entry as PerformanceResourceTiming).transferSize
              }
            })
          }
        })
      })
      
      observer.observe({ entryTypes: ['resource'] })
      this.observers.set('resource', observer)
    }
  }

  private setupLargestContentfulPaint() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        logger.info('Largest Contentful Paint', {
          value: lastEntry.startTime,
          metadata: {
            elementTag: (lastEntry as any).element?.tagName
          }
        })
      })
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.set('lcp', observer)
      } catch (error) {
        // LCP not supported in this browser
      }
    }
  }

  private setupFirstInputDelay() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const fidEntry = entry as any
          logger.info('First Input Delay', {
            value: fidEntry.processingStart - entry.startTime,
            metadata: {
              entryName: entry.name
            }
          })
        })
      })
      
      try {
        observer.observe({ entryTypes: ['first-input'] })
        this.observers.set('fid', observer)
      } catch (error) {
        // FID not supported in this browser
      }
    }
  }

  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect()
    })
    this.observers.clear()
    this.metrics.clear()
  }
}

export const performanceMonitor = new PerformanceMonitor()