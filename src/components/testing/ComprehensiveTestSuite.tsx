import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { getCopy } from '@/lib/constants/copy';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  TrendingUp,
  Shield,
  Smartphone,
  Monitor,
  Zap,
  Users,
  Database,
  Globe
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'mobile';
  status: 'running' | 'passed' | 'failed' | 'pending';
  duration?: number;
  error?: string;
  coverage?: number;
}

interface TestCategory {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  tests: TestResult[];
}

export function ComprehensiveTestSuite() {
  const isMobile = useIsMobile();
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState(0);
  const [testCategories, setTestCategories] = useState<TestCategory[]>([
    {
      name: 'Unit Tests',
      icon: TestTube,
      color: 'text-blue-600',
      tests: [
        { id: 'unit-1', name: 'Stellar Address Validation', category: 'unit', status: 'pending' },
        { id: 'unit-2', name: 'Balance Formatting', category: 'unit', status: 'pending' },
        { id: 'unit-3', name: 'Copy Management', category: 'unit', status: 'pending' },
        { id: 'unit-4', name: 'Mobile Detection Hooks', category: 'unit', status: 'pending' },
        { id: 'unit-5', name: 'QR Code Generation', category: 'unit', status: 'pending' },
      ]
    },
    {
      name: 'Integration Tests',
      icon: Database,
      color: 'text-green-600',
      tests: [
        { id: 'int-1', name: 'Authentication Flow', category: 'integration', status: 'pending' },
        { id: 'int-2', name: 'Payment Processing', category: 'integration', status: 'pending' },
        { id: 'int-3', name: 'Stellar Network Connection', category: 'integration', status: 'pending' },
        { id: 'int-4', name: 'Profile Management', category: 'integration', status: 'pending' },
      ]
    },
    {
      name: 'E2E Tests',
      icon: Globe,
      color: 'text-purple-600',
      tests: [
        { id: 'e2e-1', name: 'Complete User Journey', category: 'e2e', status: 'pending' },
        { id: 'e2e-2', name: 'Send Money Flow', category: 'e2e', status: 'pending' },
        { id: 'e2e-3', name: 'Receive Money Flow', category: 'e2e', status: 'pending' },
        { id: 'e2e-4', name: 'KYC Verification', category: 'e2e', status: 'pending' },
      ]
    },
    {
      name: 'Performance Tests',
      icon: Zap,
      color: 'text-yellow-600',
      tests: [
        { id: 'perf-1', name: 'Page Load Speed', category: 'performance', status: 'pending' },
        { id: 'perf-2', name: 'Bundle Size Analysis', category: 'performance', status: 'pending' },
        { id: 'perf-3', name: 'API Response Times', category: 'performance', status: 'pending' },
        { id: 'perf-4', name: 'Memory Usage', category: 'performance', status: 'pending' },
      ]
    },
    {
      name: 'Security Tests',
      icon: Shield,
      color: 'text-red-600',
      tests: [
        { id: 'sec-1', name: 'XSS Vulnerability Scan', category: 'security', status: 'pending' },
        { id: 'sec-2', name: 'SQL Injection Test', category: 'security', status: 'pending' },
        { id: 'sec-3', name: 'Auth Token Security', category: 'security', status: 'pending' },
        { id: 'sec-4', name: 'Data Encryption Check', category: 'security', status: 'pending' },
      ]
    },
    {
      name: 'Mobile Tests',
      icon: Smartphone,
      color: 'text-indigo-600',
      tests: [
        { id: 'mob-1', name: 'Touch Target Sizes', category: 'mobile', status: 'pending' },
        { id: 'mob-2', name: 'Responsive Layout', category: 'mobile', status: 'pending' },
        { id: 'mob-3', name: 'Keyboard Handling', category: 'mobile', status: 'pending' },
        { id: 'mob-4', name: 'Orientation Changes', category: 'mobile', status: 'pending' },
      ]
    }
  ]);

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallProgress(0);
    
    const allTests = testCategories.flatMap(cat => cat.tests);
    const totalTests = allTests.length;
    let completedTests = 0;

    for (const category of testCategories) {
      for (const test of category.tests) {
        setCurrentTest(test.name);
        
        // Update test status to running
        setTestCategories(prev => prev.map(cat => ({
          ...cat,
          tests: cat.tests.map(t => 
            t.id === test.id ? { ...t, status: 'running' as const } : t
          )
        })));

        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
        
        // Randomly pass or fail tests (90% pass rate)
        const passed = Math.random() > 0.1;
        const duration = Math.random() * 1000 + 100;
        const coverage = Math.random() * 30 + 70; // 70-100% coverage
        
        setTestCategories(prev => prev.map(cat => ({
          ...cat,
          tests: cat.tests.map(t => 
            t.id === test.id ? { 
              ...t, 
              status: passed ? 'passed' as const : 'failed' as const,
              duration: Math.round(duration),
              coverage: Math.round(coverage),
              error: passed ? undefined : 'Mock test failure for demonstration'
            } : t
          )
        })));

        completedTests++;
        setOverallProgress((completedTests / totalTests) * 100);
      }
    }
    
    setIsRunning(false);
    setCurrentTest('');
  };

  const resetTests = () => {
    setTestCategories(prev => prev.map(cat => ({
      ...cat,
      tests: cat.tests.map(test => ({
        ...test,
        status: 'pending' as const,
        duration: undefined,
        error: undefined,
        coverage: undefined
      }))
    })));
    setOverallProgress(0);
    setCurrentTest('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'running':
        return <Clock className="h-4 w-4 animate-spin" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const allTests = testCategories.flatMap(cat => cat.tests);
  const passedTests = allTests.filter(t => t.status === 'passed').length;
  const failedTests = allTests.filter(t => t.status === 'failed').length;
  const totalTests = allTests.length;

  return (
    <div className="w-full space-y-6">
      {/* Test Overview */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>Comprehensive Test Suite</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="mobile-button-primary"
              >
                {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isRunning ? 'Running...' : 'Run All Tests'}
              </Button>
              <Button 
                onClick={resetTests} 
                variant="outline"
                disabled={isRunning}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalTests}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((passedTests / totalTests) * 100) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              {currentTest && (
                <div className="text-sm text-muted-foreground">
                  Currently running: {currentTest}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-7'}`}>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unit">Unit</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="e2e">E2E</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {testCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="mobile-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <category.icon className={`h-4 w-4 ${category.color}`} />
                  <span>{category.name}</span>
                  <Badge variant="outline">
                    {category.tests.filter(t => t.status === 'passed').length}/{category.tests.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {category.tests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(test.status)}
                        <span className="text-sm font-medium">{test.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {test.duration && (
                          <span className="text-xs text-muted-foreground">
                            {test.duration}ms
                          </span>
                        )}
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Individual category tabs */}
        {testCategories.map((category) => (
          <TabsContent key={category.name.toLowerCase()} value={category.name.toLowerCase().split(' ')[0]} className="space-y-4">
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                  <span>{category.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.tests.map((test) => (
                  <div key={test.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{test.name}</div>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                    {test.duration && (
                      <div className="text-sm text-muted-foreground mb-2">
                        Execution time: {test.duration}ms
                      </div>
                    )}
                    {test.coverage && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Code Coverage</span>
                          <span>{test.coverage}%</span>
                        </div>
                        <Progress value={test.coverage} className="h-1" />
                      </div>
                    )}
                    {test.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {test.error}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}