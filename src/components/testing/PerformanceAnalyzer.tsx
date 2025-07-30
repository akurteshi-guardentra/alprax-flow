import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Clock, Database, Wifi, Cpu, HardDrive, Play, TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  description: string;
  category: 'loading' | 'runtime' | 'network' | 'resource';
  icon: React.ComponentType<any>;
  status: 'pending' | 'running' | 'completed';
  progress: number;
  currentValue?: number;
  baselineValue?: number;
  threshold: {
    good: number;
    acceptable: number;
  };
  unit: string;
  trend?: 'up' | 'down' | 'stable';
}

export function PerformanceAnalyzer() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'lcp',
      name: 'Largest Contentful Paint',
      description: 'Time to render the largest visible element',
      category: 'loading',
      icon: Clock,
      status: 'pending',
      progress: 0,
      threshold: { good: 2500, acceptable: 4000 },
      unit: 'ms'
    },
    {
      id: 'fid',
      name: 'First Input Delay',
      description: 'Time from first user input to browser response',
      category: 'runtime',
      icon: Zap,
      status: 'pending',
      progress: 0,
      threshold: { good: 100, acceptable: 300 },
      unit: 'ms'
    },
    {
      id: 'cls',
      name: 'Cumulative Layout Shift',
      description: 'Visual stability of page layout',
      category: 'runtime',
      icon: TrendingUp,
      status: 'pending',
      progress: 0,
      threshold: { good: 0.1, acceptable: 0.25 },
      unit: ''
    },
    {
      id: 'ttfb',
      name: 'Time to First Byte',
      description: 'Server response time',
      category: 'network',
      icon: Wifi,
      status: 'pending',
      progress: 0,
      threshold: { good: 800, acceptable: 1800 },
      unit: 'ms'
    },
    {
      id: 'fcp',
      name: 'First Contentful Paint',
      description: 'Time to first rendered content',
      category: 'loading',
      icon: Clock,
      status: 'pending',
      progress: 0,
      threshold: { good: 1800, acceptable: 3000 },
      unit: 'ms'
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      description: 'JavaScript heap size usage',
      category: 'resource',
      icon: Cpu,
      status: 'pending',
      progress: 0,
      threshold: { good: 50, acceptable: 75 },
      unit: 'MB'
    },
    {
      id: 'bundle-size',
      name: 'Bundle Size',
      description: 'Total JavaScript bundle size',
      category: 'resource',
      icon: HardDrive,
      status: 'pending',
      progress: 0,
      threshold: { good: 200, acceptable: 500 },
      unit: 'KB'
    },
    {
      id: 'dom-nodes',
      name: 'DOM Complexity',
      description: 'Number of DOM nodes',
      category: 'resource',
      icon: Database,
      status: 'pending',
      progress: 0,
      threshold: { good: 1500, acceptable: 3000 },
      unit: 'nodes'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);

  const runAnalysis = async () => {
    setIsRunning(true);
    setOverallScore(null);
    
    // Reset all metrics
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      status: 'running',
      progress: 0,
      currentValue: undefined,
      baselineValue: undefined,
      trend: undefined
    })));

    // Simulate metrics collection
    const metricDurations = Array(metrics.length).fill(0).map(() => 1500 + Math.random() * 2000);
    
    metrics.forEach((metric, index) => {
      simulateMetricCollection(metric.id, metricDurations[index]);
    });
  };

  const simulateMetricCollection = async (metricId: string, duration: number) => {
    const steps = 25;
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      setMetrics(prev => prev.map(metric => {
        if (metric.id === metricId) {
          const progress = (i / steps) * 100;
          const isCompleted = i === steps;
          
          if (isCompleted) {
            const value = generateRealisticValue(metric);
            const baseline = value + (Math.random() - 0.5) * value * 0.3;
            const trend = value < baseline ? 'up' : value > baseline ? 'down' : 'stable';
            
            return {
              ...metric,
              status: 'completed',
              progress: 100,
              currentValue: Number(value.toFixed(metric.unit === '' ? 3 : 0)),
              baselineValue: Number(baseline.toFixed(metric.unit === '' ? 3 : 0)),
              trend
            };
          }
          
          return {
            ...metric,
            progress
          };
        }
        return metric;
      }));
    }
  };

  const generateRealisticValue = (metric: PerformanceMetric): number => {
    const base = metric.threshold.good;
    const range = metric.threshold.acceptable - metric.threshold.good;
    
    // Bias towards good performance with some variation
    const performanceMultiplier = 0.3 + Math.random() * 1.2; // 0.3 to 1.5
    
    switch (metric.id) {
      case 'lcp':
        return base + (range * performanceMultiplier);
      case 'fid':
        return Math.max(20, base * performanceMultiplier);
      case 'cls':
        return Math.max(0.01, metric.threshold.good * performanceMultiplier);
      case 'ttfb':
        return base + (range * performanceMultiplier);
      case 'fcp':
        return base + (range * performanceMultiplier);
      case 'memory':
        return base + (range * performanceMultiplier);
      case 'bundle-size':
        return base + (range * performanceMultiplier);
      case 'dom-nodes':
        return base + (range * performanceMultiplier);
      default:
        return base + (range * performanceMultiplier);
    }
  };

  const allCompleted = metrics.every(metric => metric.status === 'completed');

  useEffect(() => {
    if (allCompleted && isRunning) {
      setIsRunning(false);
      
      // Calculate overall performance score
      const scores = metrics.map(metric => {
        if (!metric.currentValue) return 0;
        
        if (metric.currentValue <= metric.threshold.good) return 100;
        if (metric.currentValue <= metric.threshold.acceptable) {
          const range = metric.threshold.acceptable - metric.threshold.good;
          const position = metric.currentValue - metric.threshold.good;
          return 100 - (position / range) * 50; // 50-100 range
        }
        return Math.max(0, 50 - ((metric.currentValue - metric.threshold.acceptable) / metric.threshold.acceptable) * 50);
      });
      
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      setOverallScore(Math.round(avgScore));
    }
  }, [allCompleted, isRunning, metrics]);

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (!metric.currentValue) return 'pending';
    
    if (metric.currentValue <= metric.threshold.good) return 'good';
    if (metric.currentValue <= metric.threshold.acceptable) return 'acceptable';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'acceptable':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge variant="secondary" className="text-green-600">Good</Badge>;
      case 'acceptable':
        return <Badge variant="secondary" className="text-yellow-600">Needs Improvement</Badge>;
      case 'poor':
        return <Badge variant="destructive">Poor</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getCategoryMetrics = (category: PerformanceMetric['category']) => {
    return metrics.filter(metric => metric.category === category);
  };

  const categories = [
    { id: 'loading', name: 'Loading Performance', description: 'Page load and rendering metrics' },
    { id: 'runtime', name: 'Runtime Performance', description: 'User interaction and responsiveness' },
    { id: 'network', name: 'Network Performance', description: 'Request and response timings' },
    { id: 'resource', name: 'Resource Usage', description: 'Memory and asset optimization' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Analysis
              </CardTitle>
              <CardDescription>
                Comprehensive performance monitoring and optimization insights
              </CardDescription>
            </div>
            <Button
              onClick={runAnalysis}
              disabled={isRunning}
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Analysis
            </Button>
          </div>
        </CardHeader>
        
        {allCompleted && overallScore !== null && (
          <CardContent>
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <div className="text-4xl font-bold text-primary mb-2">{overallScore}</div>
              <div className="text-lg font-medium mb-1">Performance Score</div>
              <div className="text-sm text-muted-foreground">
                {overallScore >= 90 ? 'Excellent' : overallScore >= 75 ? 'Good' : overallScore >= 50 ? 'Needs Improvement' : 'Poor'}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Performance Categories */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryMetrics = getCategoryMetrics(category.id as PerformanceMetric['category']);
          
          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryMetrics.map((metric) => {
                    const IconComponent = metric.icon;
                    const status = getMetricStatus(metric);
                    
                    return (
                      <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          metric.status === 'running' ? 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20' : 'border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-medium">{metric.name}</div>
                              <div className="text-xs text-muted-foreground">{metric.description}</div>
                            </div>
                          </div>
                          {getTrendIcon(metric.trend)}
                        </div>

                        {metric.status === 'running' && (
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-sm">
                              <span>Analyzing...</span>
                              <span>{Math.round(metric.progress)}%</span>
                            </div>
                            <Progress value={metric.progress} className="h-1" />
                          </div>
                        )}

                        {metric.status === 'completed' && metric.currentValue !== undefined && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className={`text-2xl font-bold ${getStatusColor(status)}`}>
                                {metric.currentValue}{metric.unit}
                              </div>
                              {getStatusBadge(status)}
                            </div>
                            
                            {metric.baselineValue && (
                              <div className="text-sm text-muted-foreground">
                                Baseline: {metric.baselineValue}{metric.unit}
                                {metric.trend === 'up' && ' (↑ Improved)'}
                                {metric.trend === 'down' && ' (↓ Degraded)'}
                              </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground">
                              Target: ≤{metric.threshold.good}{metric.unit} (Good) | 
                              ≤{metric.threshold.acceptable}{metric.unit} (Acceptable)
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}