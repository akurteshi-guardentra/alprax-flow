/**
 * Deployment health and readiness utilities
 * Ensures the application is production-ready
 */

import { ENV } from '@/config/environment';
import { supabase } from '@/integrations/supabase/client';

export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  data?: any;
}

export interface DeploymentReadinessReport {
  overall: 'ready' | 'not-ready' | 'degraded';
  checks: HealthCheckResult[];
  timestamp: string;
  version: string;
}

/**
 * Comprehensive deployment readiness checker
 */
export class DeploymentHealthChecker {
  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<DeploymentReadinessReport> {
    const checks: HealthCheckResult[] = [];

    // Environment configuration check
    checks.push(await this.checkEnvironmentConfig());
    
    // Database connectivity check
    checks.push(await this.checkDatabaseConnectivity());
    
    // Authentication system check
    checks.push(await this.checkAuthSystem());
    
    // Storage system check
    checks.push(await this.checkStorageSystem());
    
    // Security configuration check
    checks.push(await this.checkSecurityConfig());
    
    // Performance check
    checks.push(await this.checkPerformance());
    
    // Dependencies check
    checks.push(await this.checkDependencies());

    // Determine overall status
    const failedChecks = checks.filter(c => c.status === 'fail');
    const warnChecks = checks.filter(c => c.status === 'warn');
    
    let overall: DeploymentReadinessReport['overall'] = 'ready';
    if (failedChecks.length > 0) {
      overall = 'not-ready';
    } else if (warnChecks.length > 0) {
      overall = 'degraded';
    }

    return {
      overall,
      checks,
      timestamp: new Date().toISOString(),
      version: ENV.APP_VERSION
    };
  }

  /**
   * Check environment configuration
   */
  private async checkEnvironmentConfig(): Promise<HealthCheckResult> {
    try {
      const issues: string[] = [];

      // Check required environment variables
      if (!ENV.SUPABASE_URL) issues.push('SUPABASE_URL not configured');
      if (!ENV.SUPABASE_ANON_KEY) issues.push('SUPABASE_ANON_KEY not configured');
      
      // Check production-specific settings
      if (!ENV.isDevelopment) {
        if (!ENV.FEATURES.ENABLE_ERROR_REPORTING) {
          issues.push('Error reporting should be enabled in production');
        }
        if (!ENV.FEATURES.ENABLE_PERFORMANCE_MONITORING) {
          issues.push('Performance monitoring should be enabled in production');
        }
      }

      if (issues.length > 0) {
        return {
          name: 'Environment Configuration',
          status: 'fail',
          message: `Configuration issues: ${issues.join(', ')}`,
          data: { issues }
        };
      }

      return {
        name: 'Environment Configuration',
        status: 'pass',
        message: 'All environment variables properly configured'
      };
    } catch (error) {
      return {
        name: 'Environment Configuration',
        status: 'fail',
        message: `Failed to check environment: ${error}`
      };
    }
  }

  /**
   * Check database connectivity
   */
  private async checkDatabaseConnectivity(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();
      
      // Simple query to test connectivity
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const latency = Date.now() - start;

      if (error) {
        return {
          name: 'Database Connectivity',
          status: 'fail',
          message: `Database error: ${error.message}`,
          data: { latency, error: error.message }
        };
      }

      const status = latency > 2000 ? 'warn' : 'pass';
      const message = latency > 2000 
        ? `Database responsive but slow (${latency}ms)`
        : `Database responsive (${latency}ms)`;

      return {
        name: 'Database Connectivity',
        status,
        message,
        data: { latency }
      };
    } catch (error) {
      return {
        name: 'Database Connectivity',
        status: 'fail',
        message: `Database connectivity failed: ${error}`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Check authentication system
   */
  private async checkAuthSystem(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();
      
      // Test auth system by getting current session
      const { data, error } = await supabase.auth.getSession();
      const latency = Date.now() - start;

      if (error) {
        return {
          name: 'Authentication System',
          status: 'fail',
          message: `Auth system error: ${error.message}`,
          data: { latency, error: error.message }
        };
      }

      return {
        name: 'Authentication System',
        status: 'pass',
        message: `Authentication system operational (${latency}ms)`,
        data: { latency, hasSession: !!data.session }
      };
    } catch (error) {
      return {
        name: 'Authentication System',
        status: 'fail',
        message: `Auth system check failed: ${error}`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Check storage system
   */
  private async checkStorageSystem(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();
      
      // Test storage by listing buckets
      const { data, error } = await supabase.storage.listBuckets();
      const latency = Date.now() - start;

      if (error) {
        return {
          name: 'Storage System',
          status: 'fail',
          message: `Storage error: ${error.message}`,
          data: { latency, error: error.message }
        };
      }

      return {
        name: 'Storage System',
        status: 'pass',
        message: `Storage system operational (${latency}ms)`,
        data: { latency, bucketCount: data?.length || 0 }
      };
    } catch (error) {
      return {
        name: 'Storage System',
        status: 'fail',
        message: `Storage system check failed: ${error}`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Check security configuration
   */
  private async checkSecurityConfig(): Promise<HealthCheckResult> {
    try {
      const issues: string[] = [];

      // Check HTTPS in production
      if (!ENV.isDevelopment && window.location.protocol !== 'https:') {
        issues.push('Application should use HTTPS in production');
      }

      // Check security headers (simplified check)
      try {
        const response = await fetch(window.location.href, { method: 'HEAD' });
        const headers = response.headers;

        if (!headers.get('X-Content-Type-Options')) {
          issues.push('Missing X-Content-Type-Options header');
        }
        if (!headers.get('X-Frame-Options')) {
          issues.push('Missing X-Frame-Options header');
        }
      } catch (error) {
        issues.push('Could not check security headers');
      }

      // Check Content Security Policy
      const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!metaCSP && !ENV.isDevelopment) {
        issues.push('Content Security Policy not configured');
      }

      if (issues.length > 0) {
        return {
          name: 'Security Configuration',
          status: 'warn',
          message: `Security recommendations: ${issues.join(', ')}`,
          data: { issues }
        };
      }

      return {
        name: 'Security Configuration',
        status: 'pass',
        message: 'Security configuration looks good'
      };
    } catch (error) {
      return {
        name: 'Security Configuration',
        status: 'fail',
        message: `Security check failed: ${error}`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Check application performance
   */
  private async checkPerformance(): Promise<HealthCheckResult> {
    try {
      const issues: string[] = [];
      const perfData: any = {};

      // Check page load performance
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
          
          perfData.loadTime = loadTime;
          perfData.domContentLoaded = domContentLoaded;

          if (loadTime > 3000) {
            issues.push(`Slow page load time: ${loadTime}ms`);
          }
        }

        // Check memory usage
        if ('memory' in performance) {
          const memInfo = (performance as any).memory;
          const memUsage = (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100;
          
          perfData.memoryUsage = memUsage;

          if (memUsage > 80) {
            issues.push(`High memory usage: ${memUsage.toFixed(1)}%`);
          }
        }
      }

      // Check bundle size (simplified)
      const scriptTags = document.querySelectorAll('script[src]');
      if (scriptTags.length > 10) {
        issues.push(`Many script tags (${scriptTags.length}), consider bundling`);
      }

      const status = issues.length > 0 ? 'warn' : 'pass';
      const message = issues.length > 0 
        ? `Performance issues: ${issues.join(', ')}`
        : 'Performance metrics look good';

      return {
        name: 'Performance',
        status,
        message,
        data: perfData
      };
    } catch (error) {
      return {
        name: 'Performance',
        status: 'fail',
        message: `Performance check failed: ${error}`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Check critical dependencies
   */
  private async checkDependencies(): Promise<HealthCheckResult> {
    try {
      const issues: string[] = [];

      // Check critical APIs availability
      const criticalAPIs = [
        { name: 'Stellar Network', url: 'https://horizon.stellar.org' },
        { name: 'Supabase', url: ENV.SUPABASE_URL }
      ];

      for (const api of criticalAPIs) {
        try {
          const response = await fetch(api.url, { 
            method: 'HEAD',
            mode: 'no-cors' // Avoid CORS issues for basic connectivity check
          });
          // If no error thrown, API is reachable
        } catch (error) {
          issues.push(`${api.name} not reachable`);
        }
      }

      // Check browser compatibility
      const requiredFeatures = [
        'fetch',
        'Promise',
        'localStorage',
        'crypto'
      ];

      for (const feature of requiredFeatures) {
        if (!(feature in window)) {
          issues.push(`Browser missing ${feature} support`);
        }
      }

      if (issues.length > 0) {
        return {
          name: 'Dependencies',
          status: 'warn',
          message: `Dependency issues: ${issues.join(', ')}`,
          data: { issues }
        };
      }

      return {
        name: 'Dependencies',
        status: 'pass',
        message: 'All dependencies available'
      };
    } catch (error) {
      return {
        name: 'Dependencies',
        status: 'fail',
        message: `Dependency check failed: ${error}`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

export const deploymentHealthChecker = new DeploymentHealthChecker();