import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ErrorReport {
  id: string;
  timestamp: number;
  component: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  threshold?: number;
}

/**
 * Hook for monitoring and alerting on errors and performance
 */
export function useMonitoringAndAlerting() {
  const [errorQueue, setErrorQueue] = useState<ErrorReport[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [isHealthy, setIsHealthy] = useState(true);

  const reportError = useCallback(async (
    error: Error,
    component: string,
    severity: ErrorReport['severity'] = 'medium'
  ) => {
    const errorReport: ErrorReport = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      component,
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: (await supabase.auth.getUser()).data.user?.id,
      severity
    };

    setErrorQueue(prev => [...prev, errorReport]);

    // Send critical errors immediately
    if (severity === 'critical') {
      await sendErrorToBackend(errorReport);
    }

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${severity.toUpperCase()}] Error in ${component}:`, error);
    }
  }, []);

  const reportPerformanceMetric = useCallback((
    name: string,
    value: number,
    threshold?: number
  ) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      threshold
    };

    setPerformanceMetrics(prev => [...prev.slice(-99), metric]);

    // Check if metric exceeds threshold
    if (threshold && value > threshold) {
      console.warn(`Performance threshold exceeded for ${name}: ${value} > ${threshold}`);
      
      // Create performance error for critical thresholds
      if (value > threshold * 2) {
        reportError(
          new Error(`Critical performance issue: ${name} = ${value}ms (threshold: ${threshold}ms)`),
          'PerformanceMonitor',
          'high'
        );
      }
    }
  }, [reportError]);

  const sendErrorToBackend = useCallback(async (errorReport: ErrorReport) => {
    try {
      // In a real implementation, this would send to your error tracking service
      console.log('Sending error report to backend:', errorReport);
      
      // For now, we'll store in local storage as a fallback
      const stored = localStorage.getItem('error_reports') || '[]';
      const reports = JSON.parse(stored);
      reports.push(errorReport);
      
      // Keep only last 50 reports
      if (reports.length > 50) {
        reports.splice(0, reports.length - 50);
      }
      
      localStorage.setItem('error_reports', JSON.stringify(reports));
    } catch (err) {
      console.error('Failed to send error report:', err);
    }
  }, []);

  const batchSendErrors = useCallback(async () => {
    if (errorQueue.length === 0) return;

    const errors = [...errorQueue];
    setErrorQueue([]);

    for (const error of errors) {
      await sendErrorToBackend(error);
    }
  }, [errorQueue, sendErrorToBackend]);

  const checkSystemHealth = useCallback(() => {
    const now = Date.now();
    const recentMetrics = performanceMetrics.filter(m => now - m.timestamp < 60000); // Last minute
    
    const criticalMetrics = recentMetrics.filter(m => 
      m.threshold && m.value > m.threshold * 1.5
    );

    const recentCriticalErrors = errorQueue.filter(e => 
      e.severity === 'critical' && now - e.timestamp < 300000 // Last 5 minutes
    );

    const healthy = criticalMetrics.length === 0 && recentCriticalErrors.length === 0;
    setIsHealthy(healthy);

    if (!healthy) {
      console.warn('System health check failed:', {
        criticalMetrics: criticalMetrics.length,
        criticalErrors: recentCriticalErrors.length
      });
    }

    return healthy;
  }, [performanceMetrics, errorQueue]);

  // Batch send errors every 30 seconds
  useEffect(() => {
    const interval = setInterval(batchSendErrors, 30000);
    return () => clearInterval(interval);
  }, [batchSendErrors]);

  // Health check every minute
  useEffect(() => {
    const interval = setInterval(checkSystemHealth, 60000);
    return () => clearInterval(interval);
  }, [checkSystemHealth]);

  // Monitor global errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportError(
        new Error(event.message),
        'GlobalErrorHandler',
        'high'
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(
        new Error(String(event.reason)),
        'UnhandledPromiseRejection',
        'high'
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [reportError]);

  return {
    reportError,
    reportPerformanceMetric,
    checkSystemHealth,
    isHealthy,
    errorCount: errorQueue.length,
    performanceMetrics: performanceMetrics.slice(-20), // Last 20 metrics
    batchSendErrors
  };
}
