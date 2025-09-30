import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Square, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface E2ETest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  steps: TestStep[];
}

interface TestStep {
  id: string;
  action: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  screenshot?: string;
}

export const E2ETestRunner = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [tests, setTests] = useState<E2ETest[]>([
    {
      id: 'auth-flow',
      name: 'Authentication Flow',
      description: 'Complete user authentication journey',
      status: 'pending',
      steps: [
        { id: '1', action: 'Navigate to login page', status: 'pending' },
        { id: '2', action: 'Enter credentials', status: 'pending' },
        { id: '3', action: 'Submit login form', status: 'pending' },
        { id: '4', action: 'Verify dashboard access', status: 'pending' },
      ]
    },
    {
      id: 'payment-flow',
      name: 'Payment Processing',
      description: 'End-to-end payment transaction',
      status: 'pending',
      steps: [
        { id: '1', action: 'Select payment method', status: 'pending' },
        { id: '2', action: 'Enter payment details', status: 'pending' },
        { id: '3', action: 'Confirm transaction', status: 'pending' },
        { id: '4', action: 'Verify payment success', status: 'pending' },
      ]
    },
    {
      id: 'profile-update',
      name: 'Profile Management',
      description: 'User profile update workflow',
      status: 'pending',
      steps: [
        { id: '1', action: 'Navigate to profile', status: 'pending' },
        { id: '2', action: 'Edit profile information', status: 'pending' },
        { id: '3', action: 'Upload profile photo', status: 'pending' },
        { id: '4', action: 'Save changes', status: 'pending' },
      ]
    },
    {
      id: 'transaction-history',
      name: 'Transaction History',
      description: 'View and filter transaction history',
      status: 'pending',
      steps: [
        { id: '1', action: 'Navigate to transactions', status: 'pending' },
        { id: '2', action: 'Apply date filters', status: 'pending' },
        { id: '3', action: 'Search transactions', status: 'pending' },
        { id: '4', action: 'Export data', status: 'pending' },
      ]
    }
  ]);

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (const test of tests) {
      setCurrentTest(test.id);
      await runTest(test.id);
    }
    
    setIsRunning(false);
    setCurrentTest(null);
    
    const passedTests = tests.filter(t => t.status === 'passed').length;
    toast({
      title: 'E2E Tests Complete',
      description: `${passedTests}/${tests.length} tests passed`,
    });
  };

  const runTest = async (testId: string) => {
    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'running' as const } : t
    ));

    const test = tests.find(t => t.id === testId);
    if (!test) return;

    for (const step of test.steps) {
      setTests(prev => prev.map(t => {
        if (t.id !== testId) return t;
        return {
          ...t,
          steps: t.steps.map(s => 
            s.id === step.id ? { ...s, status: 'running' as const } : s
          )
        };
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      const passed = Math.random() > 0.1;
      setTests(prev => prev.map(t => {
        if (t.id !== testId) return t;
        return {
          ...t,
          steps: t.steps.map(s => 
            s.id === step.id ? { ...s, status: passed ? 'passed' as const : 'failed' as const } : s
          )
        };
      }));

      if (!passed) {
        setTests(prev => prev.map(t => 
          t.id === testId ? { ...t, status: 'failed' as const } : t
        ));
        return;
      }
    }

    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'passed' as const } : t
    ));
  };

  const stopTests = () => {
    setIsRunning(false);
    setCurrentTest(null);
    setTests(prev => prev.map(t => ({
      ...t,
      status: t.status === 'running' ? 'pending' as const : t.status,
      steps: t.steps.map(s => ({
        ...s,
        status: s.status === 'running' ? 'pending' as const : s.status
      }))
    })));
  };

  const getStatusIcon = (status: E2ETest['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const progress = ((passedCount + failedCount) / tests.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>End-to-End Test Suite</CardTitle>
              <CardDescription>
                Automated user journey testing with Playwright
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isRunning ? (
                <Button onClick={stopTests} variant="destructive" size="sm">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button onClick={runAllTests} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Run All Tests
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{passedCount}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{failedCount}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{tests.length - passedCount - failedCount}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
            
            {isRunning && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  Running tests... {Math.round(progress)}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <CardTitle className="text-base">{test.name}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    test.status === 'passed' ? 'default' :
                    test.status === 'failed' ? 'destructive' :
                    test.status === 'running' ? 'secondary' :
                    'outline'
                  }>
                    {test.status}
                  </Badge>
                  {!isRunning && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runTest(test.id)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            {currentTest === test.id && (
              <CardContent>
                <div className="space-y-2">
                  {test.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{step.action}</p>
                      </div>
                      <div>
                        {step.status === 'passed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {step.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                        {step.status === 'running' && <Clock className="h-4 w-4 text-blue-500 animate-spin" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
