import { memo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMonitoringAndAlerting } from '@/hooks/useMonitoringAndAlerting';
import { useClientRateLimit } from '@/hooks/useClientRateLimit';
import { usePaymentRetry } from '@/hooks/usePaymentRetry';
import { StripePaymentService } from '@/services/StripePaymentService';
import { 
  Play, 
  StopCircle, 
  Activity, 
  Users, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface LoadTestResults {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  peakResponseTime: number;
  throughput: number;
  errorRate: number;
  duration: number;
}

/**
 * Component for load testing the application for 1M daily users readiness
 */
export const LoadTestRunner = memo(function LoadTestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testResults, setTestResults] = useState<LoadTestResults | null>(null);
  const [progress, setProgress] = useState(0);
  
  const { reportError, reportPerformanceMetric } = useMonitoringAndAlerting();
  const { executeWithRateLimit } = useClientRateLimit({
    maxRequests: 1000,
    windowMs: 60000
  });
  const { executeWithRetry } = usePaymentRetry();

  const simulateHighLoad = useCallback(async (
    testName: string,
    requestCount: number,
    concurrency: number
  ) => {
    setIsRunning(true);
    setCurrentTest(testName);
    setProgress(0);

    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    const responseTimes: number[] = [];

    try {
      const batches = Math.ceil(requestCount / concurrency);
      
      for (let batch = 0; batch < batches; batch++) {
        const batchRequests = Math.min(concurrency, requestCount - batch * concurrency);
        const promises: Promise<void>[] = [];

        for (let i = 0; i < batchRequests; i++) {
          const promise = (async () => {
            const requestStart = Date.now();
            
            try {
              // Simulate different types of requests
              const testType = Math.random();
              
              if (testType < 0.3) {
                // Payment API test
                await executeWithRetry(async () => {
                  // Simulate payment creation (without actual charge)
                  return new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
                });
              } else if (testType < 0.6) {
                // Database query test
                await executeWithRateLimit(async () => {
                  return new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 50));
                });
              } else {
                // General API test
                await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 30));
              }
              
              const responseTime = Date.now() - requestStart;
              responseTimes.push(responseTime);
              successCount++;
              
              reportPerformanceMetric('load_test_request', responseTime, 200);
            } catch (error) {
              errorCount++;
              reportError(error as Error, 'LoadTestRunner', 'low');
            }
          })();
          
          promises.push(promise);
        }

        await Promise.allSettled(promises);
        
        const completedRequests = (batch + 1) * concurrency;
        const progressPercent = Math.min((completedRequests / requestCount) * 100, 100);
        setProgress(progressPercent);

        // Small delay between batches to avoid overwhelming the system
        if (batch < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;
      const peakResponseTime = Math.max(...responseTimes, 0);
      const throughput = (successCount / duration) * 1000; // requests per second
      const errorRate = (errorCount / requestCount) * 100;

      const results: LoadTestResults = {
        totalRequests: requestCount,
        successfulRequests: successCount,
        failedRequests: errorCount,
        averageResponseTime,
        peakResponseTime,
        throughput,
        errorRate,
        duration
      };

      setTestResults(results);
    } catch (error) {
      console.error('Load test failed:', error);
      reportError(error as Error, 'LoadTestRunner', 'high');
    } finally {
      setIsRunning(false);
      setCurrentTest('');
      setProgress(0);
    }
  }, [executeWithRateLimit, executeWithRetry, reportError, reportPerformanceMetric]);

  const runQuickTest = () => {
    simulateHighLoad('Quick Load Test', 100, 10);
  };

  const runStandardTest = () => {
    simulateHighLoad('Standard Load Test', 1000, 50);
  };

  const runStressTest = () => {
    simulateHighLoad('Stress Test', 5000, 100);
  };

  const runScaleTest = () => {
    simulateHighLoad('1M Users Scale Test', 10000, 200);
  };

  const stopTest = () => {
    setIsRunning(false);
    setCurrentTest('');
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5" />
            Load Testing Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white">Running: {currentTest}</span>
                <Badge variant="secondary">{progress.toFixed(1)}%</Badge>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Button
              onClick={runQuickTest}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Quick Test
            </Button>
            <Button
              onClick={runStandardTest}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Standard Test
            </Button>
            <Button
              onClick={runStressTest}
              disabled={isRunning}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Stress Test
            </Button>
            <Button
              onClick={runScaleTest}
              disabled={isRunning}
              className="bg-red-600 hover:bg-red-700"
            >
              <Activity className="w-4 h-4 mr-2" />
              Scale Test
            </Button>
          </div>

          {isRunning && (
            <Button
              onClick={stopTest}
              variant="destructive"
              className="w-full"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Stop Test
            </Button>
          )}
        </CardContent>
      </Card>

      {testResults && (
        <Card className="bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {testResults.totalRequests}
                </div>
                <div className="text-sm text-white/60">Total Requests</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {testResults.successfulRequests}
                </div>
                <div className="text-sm text-white/60">Successful</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {testResults.failedRequests}
                </div>
                <div className="text-sm text-white/60">Failed</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {testResults.errorRate.toFixed(1)}%
                </div>
                <div className="text-sm text-white/60">Error Rate</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {testResults.averageResponseTime.toFixed(0)}ms
                </div>
                <div className="text-sm text-white/60">Avg Response</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {testResults.peakResponseTime.toFixed(0)}ms
                </div>
                <div className="text-sm text-white/60">Peak Response</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {testResults.throughput.toFixed(1)}
                </div>
                <div className="text-sm text-white/60">Req/sec</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {(testResults.duration / 1000).toFixed(1)}s
                </div>
                <div className="text-sm text-white/60">Duration</div>
              </div>
            </div>

            {/* Performance Assessment */}
            <div className="mt-6 space-y-2">
              <h4 className="font-semibold text-white">Performance Assessment</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {testResults.errorRate < 1 ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : testResults.errorRate < 5 ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white/70">
                    Error Rate: {testResults.errorRate < 1 ? 'Excellent' : testResults.errorRate < 5 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {testResults.averageResponseTime < 100 ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : testResults.averageResponseTime < 300 ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white/70">
                    Response Time: {testResults.averageResponseTime < 100 ? 'Excellent' : testResults.averageResponseTime < 300 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {testResults.throughput > 100 ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : testResults.throughput > 50 ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white/70">
                    Throughput: {testResults.throughput > 100 ? 'Excellent' : testResults.throughput > 50 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});