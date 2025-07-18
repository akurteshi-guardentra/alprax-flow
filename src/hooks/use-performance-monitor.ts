import { useEffect, useRef, useState } from 'react'
import { logger } from '@/utils/logger'

interface PerformanceMetrics {
  pageLoad: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  memoryUsage?: number
  domNodes: number
  renderTime: number
}

interface PerformanceThresholds {
  pageLoad: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  pageLoad: 3000, // 3 seconds
  firstContentfulPaint: 1800, // 1.8 seconds
  largestContentfulPaint: 2500, // 2.5 seconds
  cumulativeLayoutShift: 0.1, // 0.1 CLS score
  firstInputDelay: 100 // 100ms
}

export function usePerformanceMonitor(componentName?: string) {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({})
  const [isSupported, setIsSupported] = useState(false)
  const renderStartTime = useRef<number>(Date.now())
  const thresholds = useRef<PerformanceThresholds>(DEFAULT_THRESHOLDS)

  useEffect(() => {
    const supported = 'performance' in window && 'PerformanceObserver' in window
    setIsSupported(supported)
    
    if (!supported) {
      logger.warn('Performance monitoring not supported in this browser')
      return
    }

    let observers: PerformanceObserver[] = []
    let mounted = true

    const initializeMonitoring = () => {
      if (!mounted) return

      try {
        observers = measureCoreWebVitals()
        measurePageMetrics()
        measureMemoryUsage()
        measureDOMComplexity()
        
        // Measure component render time
        const renderTime = Date.now() - renderStartTime.current
        if (mounted) {
          setMetrics(prev => ({ ...prev, renderTime }))
        }
        
        if (componentName) {
          logger.performance(`${componentName} render time`, renderTime)
        }
      } catch (error) {
        console.warn('Performance monitoring initialization failed:', error)
      }
    }

    initializeMonitoring()

    // Cleanup observers on unmount
    return () => {
      mounted = false
      observers.forEach(observer => {
        try {
          observer.disconnect()
        } catch (error) {
          console.warn('Error disconnecting performance observer:', error)
        }
      })
    }
  }, [componentName])

  const measureCoreWebVitals = () => {
    const observers: PerformanceObserver[] = []
    
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        
        const lcp = lastEntry.startTime
        setMetrics(prev => ({ ...prev, largestContentfulPaint: lcp }))
        
        if (lcp > thresholds.current.largestContentfulPaint) {
          logger.warn('Poor LCP performance detected', {
            component: componentName,
            metric: 'largestContentfulPaint',
            value: lcp,
            threshold: thresholds.current.largestContentfulPaint
          })
        }
      })
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      observers.push(lcpObserver)
    } catch (error) {
      console.warn('LCP observation not supported')
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime
          setMetrics(prev => ({ ...prev, firstInputDelay: fid }))
          
          if (fid > thresholds.current.firstInputDelay) {
            logger.warn('Poor FID performance detected', {
              component: componentName,
              metric: 'firstInputDelay',
              value: fid,
              threshold: thresholds.current.firstInputDelay
            })
          }
        })
      })
      
      fidObserver.observe({ entryTypes: ['first-input'] })
      observers.push(fidObserver)
    } catch (error) {
      console.warn('FID observation not supported')
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            setMetrics(prev => ({ ...prev, cumulativeLayoutShift: clsValue }))
          }
        })
        
        if (clsValue > thresholds.current.cumulativeLayoutShift) {
          logger.warn('Poor CLS performance detected', {
            component: componentName,
            metric: 'cumulativeLayoutShift',
            value: clsValue,
            threshold: thresholds.current.cumulativeLayoutShift
          })
        }
      })
      
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      observers.push(clsObserver)
    } catch (error) {
      console.warn('CLS observation not supported')
    }
    
    return observers
  }

  const measurePageMetrics = () => {
    // Navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      const pageLoad = navigation.loadEventEnd - navigation.fetchStart
      setMetrics(prev => ({ ...prev, pageLoad }))
      
      if (pageLoad > thresholds.current.pageLoad) {
        logger.warn('Slow page load detected', {
          component: componentName,
          metric: 'pageLoad',
          value: pageLoad,
          threshold: thresholds.current.pageLoad
        })
      }
    }

    // Paint timing
    const paintEntries = performance.getEntriesByType('paint')
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        const fcp = entry.startTime
        setMetrics(prev => ({ ...prev, firstContentfulPaint: fcp }))
        
        if (fcp > thresholds.current.firstContentfulPaint) {
          logger.warn('Slow FCP detected', {
            component: componentName,
            metric: 'firstContentfulPaint',
            value: fcp,
            threshold: thresholds.current.firstContentfulPaint
          })
        }
      }
    })
  }

  const measureMemoryUsage = () => {
    // @ts-ignore - performance.memory is not in all browsers
    if ('memory' in performance) {
      // @ts-ignore
      const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024 // MB
      setMetrics(prev => ({ ...prev, memoryUsage }))
      
      // Warn if memory usage is high (> 100MB)
      if (memoryUsage > 100) {
        logger.warn('High memory usage detected', {
          component: componentName,
          metric: 'memoryUsage',
          value: memoryUsage,
          unit: 'MB'
        })
      }
    }
  }

  const measureDOMComplexity = () => {
    const domNodes = document.querySelectorAll('*').length
    setMetrics(prev => ({ ...prev, domNodes }))
    
    // Warn if DOM is too complex (> 1500 nodes)
    if (domNodes > 1500) {
      logger.warn('Complex DOM detected', {
        component: componentName,
        metric: 'domNodes',
        value: domNodes
      })
    }
  }

  const getPerformanceScore = (): number => {
    if (Object.keys(metrics).length === 0) return 0
    
    let score = 100
    
    // Deduct points for poor metrics
    if (metrics.pageLoad && metrics.pageLoad > thresholds.current.pageLoad) {
      score -= 20
    }
    if (metrics.firstContentfulPaint && metrics.firstContentfulPaint > thresholds.current.firstContentfulPaint) {
      score -= 15
    }
    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > thresholds.current.largestContentfulPaint) {
      score -= 20
    }
    if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > thresholds.current.cumulativeLayoutShift) {
      score -= 25
    }
    if (metrics.firstInputDelay && metrics.firstInputDelay > thresholds.current.firstInputDelay) {
      score -= 20
    }
    
    return Math.max(0, score)
  }

  const markComponentMount = (name: string) => {
    if ('performance' in window) {
      performance.mark(`${name}-mount-start`)
    }
  }

  const markComponentUnmount = (name: string) => {
    if ('performance' in window) {
      performance.mark(`${name}-mount-end`)
      performance.measure(`${name}-mount-duration`, `${name}-mount-start`, `${name}-mount-end`)
      
      const measure = performance.getEntriesByName(`${name}-mount-duration`)[0]
      if (measure) {
        logger.performance(`${name} mount duration`, measure.duration)
      }
    }
  }

  const logPerformanceReport = () => {
    const score = getPerformanceScore()
    
    logger.info('Performance report generated', {
      component: componentName,
      metrics,
      score,
      thresholds: thresholds.current
    })
  }

  return {
    metrics,
    isSupported,
    performanceScore: getPerformanceScore(),
    markComponentMount,
    markComponentUnmount,
    logPerformanceReport,
    setThresholds: (newThresholds: Partial<PerformanceThresholds>) => {
      thresholds.current = { ...thresholds.current, ...newThresholds }
    }
  }
}