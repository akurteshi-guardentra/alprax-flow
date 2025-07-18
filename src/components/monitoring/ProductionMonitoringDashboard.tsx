import { Suspense, lazy } from 'react';
import { useMonitoringAndAlerting } from '@/hooks/useMonitoringAndAlerting';
import { useClientRateLimit } from '@/hooks/useClientRateLimit';
import { useSecurityHardening } from '@/hooks/useSecurityHardening';
import { useRealTimePaymentStatus } from '@/hooks/useRealTimePaymentStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap,
  Lock,
  RefreshCw
} from 'lucide-react';

// Lazy load heavy monitoring components
const LazySystemHealthDashboard = lazy(() => 
  import('@/components/admin/SystemHealthDashboard').then(module => ({ 
    default: module.SystemHealthDashboard 
  }))
);

/**
 * Production-ready monitoring dashboard for system health and security
 */
export function ProductionMonitoringDashboard() {
  const {
    reportError,
    reportPerformanceMetric,
    isHealthy,
    errorCount,
    performanceMetrics,
    checkSystemHealth
  } = useMonitoringAndAlerting();

  const {
    isLimited,
    timeUntilReset,
    executeWithRateLimit
  } = useClientRateLimit({
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    blockDurationMs: 300000 // 5 minutes
  });

  const {
    isSessionValid,
    isAccountLocked,
    loginAttempts,
    lockoutTimeRemaining,
    setupSecurityHeaders
  } = useSecurityHardening();

  const handleTestError = () => {
    reportError(
      new Error('Test error for monitoring system'),
      'ProductionMonitoringDashboard',
      'medium'
    );
  };

  const handlePerformanceTest = () => {
    const start = performance.now();
    
    // Simulate some work
    setTimeout(() => {
      const duration = performance.now() - start;
      reportPerformanceMetric('test_operation', duration, 100);
    }, Math.random() * 200);
  };

  const handleRateLimitTest = async () => {
    try {
      await executeWithRateLimit(async () => {
        console.log('Rate limit test passed');
        return Promise.resolve();
      });
    } catch (error) {
      console.error('Rate limit test failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">System Monitoring</h1>
        <div className="flex items-center gap-2">
          <Badge variant={isHealthy ? "default" : "destructive"} className={isHealthy ? "bg-green-600" : ""}>
            {isHealthy ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Healthy
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-1" />
                Issues Detected
              </>
            )}
          </Badge>
          <Button
            onClick={checkSystemHealth}
            variant="outline"
            size="sm"
            className="text-white border-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Health
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Health */}
        <Card className="bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isHealthy ? '100%' : '⚠️'}
            </div>
            <p className="text-xs text-white/60">
              {isHealthy ? 'All systems operational' : 'Issues detected'}
            </p>
          </CardContent>
        </Card>

        {/* Error Count */}
        <Card className="bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Error Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{errorCount}</div>
            <p className="text-xs text-white/60">Pending error reports</p>
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card className="bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              Rate Limiting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLimited ? (
                <span className="text-red-400">Limited</span>
              ) : (
                <span className="text-green-400">Active</span>
              )}
            </div>
            <p className="text-xs text-white/60">
              {isLimited ? `Reset in ${timeUntilReset}s` : 'Protection enabled'}
            </p>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card className="bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isAccountLocked ? (
                <Lock className="w-6 h-6 text-red-400" />
              ) : isSessionValid ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <Clock className="w-6 h-6 text-yellow-400" />
              )}
            </div>
            <p className="text-xs text-white/60">
              {isAccountLocked 
                ? `Locked for ${lockoutTimeRemaining}s`
                : isSessionValid 
                ? 'Session valid'
                : 'Session expired'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {(isAccountLocked || !isSessionValid || loginAttempts > 0) && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Security Alert: 
            {isAccountLocked && ` Account locked (${lockoutTimeRemaining}s remaining).`}
            {!isSessionValid && ' Session expired.'}
            {loginAttempts > 0 && ` ${loginAttempts} failed login attempts.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Rate Limit Alert */}
      {isLimited && (
        <Alert variant="destructive">
          <Zap className="h-4 w-4" />
          <AlertDescription>
            Rate limit exceeded. Please wait {timeUntilReset} seconds before making more requests.
          </AlertDescription>
        </Alert>
      )}

      {/* Performance Metrics */}
      <Card className="bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {performanceMetrics.slice(-5).map((metric, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-white/70">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white">{metric.value.toFixed(2)}ms</span>
                  {metric.threshold && metric.value > metric.threshold && (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
            {performanceMetrics.length === 0 && (
              <p className="text-white/60">No performance metrics recorded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className="bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">System Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleTestError}
              variant="outline"
              size="sm"
              className="text-white border-white/20"
            >
              Test Error Reporting
            </Button>
            <Button
              onClick={handlePerformanceTest}
              variant="outline"
              size="sm"
              className="text-white border-white/20"
            >
              Test Performance
            </Button>
            <Button
              onClick={handleRateLimitTest}
              variant="outline"
              size="sm"
              className="text-white border-white/20"
            >
              Test Rate Limit
            </Button>
            <Button
              onClick={setupSecurityHeaders}
              variant="outline"
              size="sm"
              className="text-white border-white/20"
            >
              Check Security
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Health Dashboard */}
      <Card className="bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Detailed System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          }>
            <LazySystemHealthDashboard />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}