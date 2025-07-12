/**
 * Production monitoring and alerting utilities
 * Provides performance tracking, error monitoring, and health checks
 */

import { ENV } from '@/config/environment';
import { errorTracker } from './error-tracking';

export interface MetricData {
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  error?: string;
  timestamp: number;
}

class ProductionMonitor {
  private metrics: Map<string, MetricData[]> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alertThresholds: Map<string, number> = new Map();

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>, metadata?: Record<string, any>): void {
    if (!ENV.FEATURES.ENABLE_PERFORMANCE_MONITORING) return;

    const metric: MetricData = {
      value,
      timestamp: Date.now(),
      tags,
      metadata
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only last 100 metrics per type
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Check for alerts
    this.checkMetricAlert(name, value);

    // Log in development
    if (ENV.isDevelopment) {
      console.log(`📊 Metric: ${name} = ${value}`, { tags, metadata });
    }
  }

  /**
   * Record a health check result
   */
  recordHealthCheck(name: string, status: HealthCheck['status'], latency?: number, error?: string): void {
    const healthCheck: HealthCheck = {
      name,
      status,
      latency,
      error,
      timestamp: Date.now()
    };

    this.healthChecks.set(name, healthCheck);

    // Alert on unhealthy services
    if (status === 'unhealthy') {
      this.sendAlert(`Health check failed: ${name}`, { error, latency });
    }

    if (ENV.isDevelopment) {
      console.log(`🏥 Health: ${name} = ${status}`, { latency, error });
    }
  }

  /**
   * Set alert threshold for a metric
   */
  setAlertThreshold(metricName: string, threshold: number): void {
    this.alertThresholds.set(metricName, threshold);
  }

  /**
   * Check if metric exceeds alert threshold
   */
  private checkMetricAlert(name: string, value: number): void {
    const threshold = this.alertThresholds.get(name);
    if (!threshold) return;

    if (value > threshold) {
      this.sendAlert(`Metric threshold exceeded: ${name}`, { 
        value, 
        threshold,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Send alert notification
   */
  private sendAlert(message: string, data?: Record<string, any>): void {
    console.warn(`🚨 ALERT: ${message}`, data);
    
    if (ENV.FEATURES.ENABLE_ERROR_REPORTING) {
      errorTracker.captureUserAction('alert_triggered', { message, ...data });
    }

    // In production, this would integrate with alerting services
    // like PagerDuty, Slack, or email notifications
  }

  /**
   * Get metrics for a specific name
   */
  getMetrics(name: string): MetricData[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Get all health checks
   */
  getHealthChecks(): Map<string, HealthCheck> {
    return new Map(this.healthChecks);
  }

  /**
   * Get overall system health
   */
  getSystemHealth(): {
    status: 'healthy' | 'unhealthy' | 'degraded';
    services: HealthCheck[];
    summary: {
      healthy: number;
      unhealthy: number;
      degraded: number;
    };
  } {
    const services = Array.from(this.healthChecks.values());
    
    const summary = services.reduce(
      (acc, service) => {
        acc[service.status]++;
        return acc;
      },
      { healthy: 0, unhealthy: 0, degraded: 0 }
    );

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (summary.unhealthy > 0) {
      overallStatus = 'unhealthy';
    } else if (summary.degraded > 0) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      services,
      summary
    };
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): {
    avgResponseTime: number;
    errorRate: number;
    totalRequests: number;
    uptime: number;
  } {
    const responseTimeMetrics = this.getMetrics('response_time');
    const errorMetrics = this.getMetrics('error_count');
    const requestMetrics = this.getMetrics('request_count');

    const avgResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0;

    const totalErrors = errorMetrics.reduce((sum, m) => sum + m.value, 0);
    const totalRequests = requestMetrics.reduce((sum, m) => sum + m.value, 0);
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    // Calculate uptime (simplified)
    const uptimeStart = Math.min(...Array.from(this.healthChecks.values()).map(h => h.timestamp));
    const uptime = uptimeStart ? Date.now() - uptimeStart : 0;

    return {
      avgResponseTime,
      errorRate,
      totalRequests,
      uptime
    };
  }

  /**
   * Start automatic health checks
   */
  startHealthChecks(): void {
    // Check application health every 30 seconds
    setInterval(() => {
      this.performHealthChecks();
    }, 30000);

    // Initial health check
    this.performHealthChecks();
  }

  /**
   * Perform all health checks
   */
  private async performHealthChecks(): Promise<void> {
    // Database health check
    try {
      const start = Date.now();
      // Simple connectivity check
      const response = await fetch('/api/health/db');
      const latency = Date.now() - start;
      
      if (response.ok) {
        this.recordHealthCheck('database', 'healthy', latency);
      } else {
        this.recordHealthCheck('database', 'degraded', latency, `HTTP ${response.status}`);
      }
    } catch (error) {
      this.recordHealthCheck('database', 'unhealthy', undefined, error instanceof Error ? error.message : 'Unknown error');
    }

    // Memory usage check
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedMemory = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
      
      if (usedMemory > 0.9) {
        this.recordHealthCheck('memory', 'degraded', usedMemory * 100);
      } else {
        this.recordHealthCheck('memory', 'healthy', usedMemory * 100);
      }
    }

    // Network connectivity check
    try {
      const start = Date.now();
      await fetch('/api/health/network', { method: 'HEAD' });
      const latency = Date.now() - start;
      this.recordHealthCheck('network', 'healthy', latency);
    } catch (error) {
      this.recordHealthCheck('network', 'unhealthy', undefined, 'No connectivity');
    }
  }
}

export const productionMonitor = new ProductionMonitor();

// Set up default alert thresholds
productionMonitor.setAlertThreshold('response_time', 5000); // 5 seconds
productionMonitor.setAlertThreshold('error_rate', 5); // 5%
productionMonitor.setAlertThreshold('memory_usage', 90); // 90%

// Start health checks in production
if (!ENV.isDevelopment) {
  productionMonitor.startHealthChecks();
}
