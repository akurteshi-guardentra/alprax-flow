// Production performance monitoring and optimization
import { ENV } from '@/config/environment';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

interface WebVitals {
  CLS?: number;
  FID?: number;
  FCP?: number;
  LCP?: number;
  TTFB?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitals = {};
  private observer?: PerformanceObserver;

  constructor() {
    this.setupPerformanceObserver();
    this.setupWebVitalsTracking();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(entry.name, entry.duration, {
            type: entry.entryType,
            startTime: entry.startTime
          });
        }
      });

      this.observer.observe({ 
        entryTypes: ['measure', 'navigation', 'resource', 'paint'] 
      });
    } catch (error) {
      console.warn('Failed to setup PerformanceObserver:', error);
    }
  }

  private setupWebVitalsTracking(): void {
    // Track Largest Contentful Paint (LCP)
    this.trackLCP();
    
    // Track First Input Delay (FID)
    this.trackFID();
    
    // Track Cumulative Layout Shift (CLS)
    this.trackCLS();
    
    // Track First Contentful Paint (FCP)
    this.trackFCP();
    
    // Track Time to First Byte (TTFB)
    this.trackTTFB();
  }

  private trackLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.webVitals.LCP = lastEntry.startTime;
        this.recordMetric('LCP', lastEntry.startTime, { type: 'web-vital' });
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      console.warn('Failed to track LCP:', error);
    }
  }

  private trackFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.webVitals.FID = (entry as any).processingStart - entry.startTime;
          this.recordMetric('FID', this.webVitals.FID, { type: 'web-vital' });
        }
      });

      observer.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      console.warn('Failed to track FID:', error);
    }
  }

  private trackCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.webVitals.CLS = clsValue;
        this.recordMetric('CLS', clsValue, { type: 'web-vital' });
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.warn('Failed to track CLS:', error);
    }
  }

  private trackFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.webVitals.FCP = entry.startTime;
            this.recordMetric('FCP', entry.startTime, { type: 'web-vital' });
          }
        }
      });

      observer.observe({ type: 'paint', buffered: true });
    } catch (error) {
      console.warn('Failed to track FCP:', error);
    }
  }

  private trackTTFB(): void {
    if (!('navigation' in performance)) return;

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.webVitals.TTFB = navigation.responseStart - navigation.requestStart;
        this.recordMetric('TTFB', this.webVitals.TTFB, { type: 'web-vital' });
      }
    } catch (error) {
      console.warn('Failed to track TTFB:', error);
    }
  }

  public recordMetric(name: string, value: number, context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context
    };

    this.metrics.push(metric);

    // Log in development
    if (ENV.isDevelopment) {
      console.log(`Performance metric: ${name} = ${value.toFixed(2)}ms`, context);
    }

    // Send to monitoring service in production
    if (ENV.isProduction && ENV.FEATURES.ENABLE_PERFORMANCE_MONITORING) {
      this.sendMetricToService(metric);
    }

    // Keep only recent metrics
    this.metrics = this.metrics.slice(-100);
  }

  private sendMetricToService(metric: PerformanceMetric): void {
    // In a real application, this would send to a monitoring service
    // For now, we'll just store it locally
    try {
      const existingMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      existingMetrics.push(metric);
      
      // Keep only the last 50 metrics
      const recentMetrics = existingMetrics.slice(-50);
      localStorage.setItem('performance_metrics', JSON.stringify(recentMetrics));
    } catch (error) {
      console.warn('Failed to store performance metric:', error);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  public getMetricSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { avg: 0, min: Infinity, max: -Infinity, count: 0 };
      }

      const stat = summary[metric.name];
      stat.count++;
      stat.min = Math.min(stat.min, metric.value);
      stat.max = Math.max(stat.max, metric.value);
      stat.avg = stat.avg + (metric.value - stat.avg) / stat.count;
    });

    return summary;
  }

  // Measure function execution time
  public measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(`function:${name}`, duration, { type: 'function' });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`function:${name}:error`, duration, { type: 'function', error: true });
      throw error;
    }
  }

  // Measure async function execution time
  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(`async-function:${name}`, duration, { type: 'async-function' });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`async-function:${name}:error`, duration, { type: 'async-function', error: true });
      throw error;
    }
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Convenience functions
export const recordMetric = (name: string, value: number, context?: Record<string, any>) =>
  performanceMonitor.recordMetric(name, value, context);

export const measureFunction = <T>(name: string, fn: () => T): T =>
  performanceMonitor.measureFunction(name, fn);

export const measureAsyncFunction = <T>(name: string, fn: () => Promise<T>): Promise<T> =>
  performanceMonitor.measureAsyncFunction(name, fn);

// Performance reporting hook
export const usePerformanceReport = () => {
  const getReport = () => ({
    metrics: performanceMonitor.getMetrics(),
    webVitals: performanceMonitor.getWebVitals(),
    summary: performanceMonitor.getMetricSummary()
  });

  return { getReport };
};
