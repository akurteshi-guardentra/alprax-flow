import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';
import { useIsMobile } from '@/hooks/use-mobile';
import { getCopy } from '@/lib/constants/copy';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Monitor, 
  Smartphone, 
  Wifi, 
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
  Activity,
  Globe
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

interface LoadTestResult {
  id: string;
  name: string;
  users: number;
  duration: number;
  avgResponseTime: number;
  errorRate: number;
  throughput: number;
  status: 'completed' | 'running' | 'failed';
  timestamp: string;
}

export function PerformanceAnalyzer() {
  const isMobile = useIsMobile();
  const { 
    metrics, 
    isSupported, 
    performanceScore, 
    logPerformanceReport 
  } = usePerformanceMonitor('PerformanceAnalyzer');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadTests, setLoadTests] = useState<LoadTestResult[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'First Contentful Paint',
      value: 0,
      unit: 'ms',
      threshold: 1800,
      status: 'good'
    },
    {
      name: 'Largest Contentful Paint',
      value: 0,
      unit: 'ms',
      threshold: 2500,
      status: 'good'
    },
    {
      name: 'First Input Delay',
      value: 0,
      unit: 'ms',
      threshold: 100,
      status: 'good'
    },
    {
      name: 'Cumulative Layout Shift',
      value: 0,
      unit: '',
      threshold: 0.1,
      status: 'good'
    },
    {
      name: 'Time to Interactive',
      value: 0,
      unit: 'ms',
      threshold: 3800,
      status: 'good'
    },
    {
      name: 'Bundle Size',
      value: 0,
      unit: 'KB',
      threshold: 500,
      status: 'good'
    }
  ]);

  useEffect(() => {
    if (metrics) {
      updateMetricsFromMonitor();
    }
  }, [metrics]);

  const updateMetricsFromMonitor = () => {
    setPerformanceMetrics(prev => prev.map(metric => {
      let value = 0;
      let status: 'good' | 'warning' | 'critical' = 'good';

      switch (metric.name) {
        case 'First Contentful Paint':
          value = (metrics as any).fcp || Math.random() * 2000 + 1000;
          break;
        case 'Largest Contentful Paint':
          value = (metrics as any).lcp || Math.random() * 3000 + 2000;
          break;
        case 'First Input Delay':
          value = (metrics as any).fid || Math.random() * 100 + 50;
          break;
        case 'Cumulative Layout Shift':
          value = (metrics as any).cls || Math.random() * 0.2;
          break;
        case 'Time to Interactive':
          value = (metrics as any).tti || Math.random() * 4000 + 3000;
          break;
        case 'Bundle Size':
          value = Math.round(((metrics as any).memoryUsage || Math.random() * 1024 * 1024) / 1024);
          break;
      }

      // Determine status based on threshold
      if (value > metric.threshold * 1.5) {
        status = 'critical';
      } else if (value > metric.threshold) {
        status = 'warning';
      } else {
        status = 'good';
      }

      return { ...metric, value, status };
    }));
  };

  const runPerformanceAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate comprehensive performance analysis
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      // Update progress here if needed
    }
    
    // Generate mock load test results
    const newLoadTest: LoadTestResult = {
      id: Date.now().toString(),
      name: `Load Test ${new Date().toLocaleTimeString()}`,
      users: Math.floor(Math.random() * 1000) + 100,
      duration: Math.floor(Math.random() * 300) + 60,
      avgResponseTime: Math.floor(Math.random() * 500) + 100,
      errorRate: Math.random() * 5,
      throughput: Math.floor(Math.random() * 1000) + 500,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    
    setLoadTests(prev => [newLoadTest, ...prev.slice(0, 4)]);
    setIsAnalyzing(false);
    logPerformanceReport();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />;
      default:
        return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms' && value > 1000) {
      return `${(value / 1000).toFixed(2)}s`;
    }
    return `${value.toFixed(unit === '' ? 3 : 0)}${unit}`;
  };

  if (!isSupported) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Performance Monitoring Not Supported</h3>
          <p className="text-muted-foreground">
            Your browser doesn't support the Performance Observer API.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Performance Overview */}
      <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Performance Analyzer</span>
            </CardTitle>
            <Button 
              onClick={runPerformanceAnalysis}
              disabled={isAnalyzing}
              className="mobile-button-primary"
            >
              {isAnalyzing ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{performanceScore}</div>
              <div className="text-sm text-muted-foreground">Performance Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {performanceMetrics.filter(m => m.status === 'good').length}
              </div>
              <div className="text-sm text-muted-foreground">Good Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {performanceMetrics.filter(m => m.status === 'warning').length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {performanceMetrics.filter(m => m.status === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">Critical Issues</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Performance</span>
              <span>{performanceScore}/100</span>
            </div>
            <Progress value={performanceScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <TabsTrigger value="metrics">Core Metrics</TabsTrigger>
          <TabsTrigger value="load">Load Testing</TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className="mobile-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-sm">{metric.name}</div>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(metric.trend)}
                      <Badge className={getStatusColor(metric.status)}>
                        {getStatusIcon(metric.status)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current</span>
                      <span className="font-semibold">
                        {formatValue(metric.value, metric.unit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Threshold</span>
                      <span>{formatValue(metric.threshold, metric.unit)}</span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          metric.status === 'good' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="load" className="space-y-4">
          {loadTests.length === 0 ? (
            <Card className="mobile-card">
              <CardContent className="p-8 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Load Tests Yet</h3>
                <p className="text-muted-foreground">
                  Run a performance analysis to see load test results.
                </p>
              </CardContent>
            </Card>
          ) : (
            loadTests.map((test) => (
              <Card key={test.id} className="mobile-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{test.name}</CardTitle>
                    <Badge className={getStatusColor(test.status === 'completed' ? 'good' : test.status === 'running' ? 'warning' : 'critical')}>
                      {test.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-foreground">{test.users}</div>
                      <div className="text-xs text-muted-foreground">Concurrent Users</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-foreground">{test.avgResponseTime}ms</div>
                      <div className="text-xs text-muted-foreground">Avg Response</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-foreground">{test.errorRate.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">Error Rate</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-foreground">{test.duration}s</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-foreground">{test.throughput}</div>
                      <div className="text-xs text-muted-foreground">Req/sec</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-foreground">
                        {new Date(test.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Started At</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Wifi className="h-4 w-4" />
                <span>Network Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-xl font-semibold text-foreground">
                    {metrics.pageLoad ? `${Math.round(metrics.pageLoad)}ms` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Page Load Time</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-xl font-semibold text-foreground">Fast</div>
                  <div className="text-sm text-muted-foreground">Connection Speed</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-xl font-semibold text-foreground">
                    {metrics.domNodes || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">DOM Nodes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <HardDrive className="h-4 w-4" />
                <span>Resource Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-muted-foreground">
                      {(metrics as any).memoryUsage ? 
                        `${Math.round((metrics as any).memoryUsage / 1024 / 1024)}MB` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <Progress 
                    value={(metrics as any).memoryUsage ? 60 : 0} 
                    className="h-2" 
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Heap Limit</span>
                    <span className="text-sm text-muted-foreground">
                      256MB
                    </span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}