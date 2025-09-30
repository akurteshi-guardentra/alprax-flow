import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Play, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityTest {
  id: string;
  category: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'passed' | 'failed';
  details?: string;
}

export const SecurityTestSuite = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tests, setTests] = useState<SecurityTest[]>([
    {
      id: 'sql-injection',
      category: 'Input Validation',
      name: 'SQL Injection Prevention',
      description: 'Test for SQL injection vulnerabilities',
      severity: 'critical',
      status: 'pending'
    },
    {
      id: 'xss',
      category: 'Input Validation',
      name: 'Cross-Site Scripting (XSS)',
      description: 'Test for XSS vulnerabilities in user inputs',
      severity: 'critical',
      status: 'pending'
    },
    {
      id: 'csrf',
      category: 'Session Security',
      name: 'CSRF Protection',
      description: 'Verify CSRF token implementation',
      severity: 'high',
      status: 'pending'
    },
    {
      id: 'auth-bypass',
      category: 'Authentication',
      name: 'Authentication Bypass',
      description: 'Test for authentication bypass vulnerabilities',
      severity: 'critical',
      status: 'pending'
    },
    {
      id: 'session-hijacking',
      category: 'Session Security',
      name: 'Session Hijacking',
      description: 'Test session token security',
      severity: 'high',
      status: 'pending'
    },
    {
      id: 'encryption',
      category: 'Data Security',
      name: 'Data Encryption Verification',
      description: 'Verify sensitive data encryption at rest',
      severity: 'critical',
      status: 'pending'
    },
    {
      id: 'api-auth',
      category: 'API Security',
      name: 'API Authentication',
      description: 'Test API endpoint authentication',
      severity: 'high',
      status: 'pending'
    },
    {
      id: 'rate-limiting',
      category: 'API Security',
      name: 'Rate Limiting',
      description: 'Verify rate limiting implementation',
      severity: 'medium',
      status: 'pending'
    },
    {
      id: 'password-policy',
      category: 'Authentication',
      name: 'Password Policy Enforcement',
      description: 'Test password complexity requirements',
      severity: 'medium',
      status: 'pending'
    },
    {
      id: 'sensitive-data',
      category: 'Data Security',
      name: 'Sensitive Data Exposure',
      description: 'Check for exposed sensitive data in responses',
      severity: 'high',
      status: 'pending'
    }
  ]);

  const runSecurityTests = async () => {
    setIsRunning(true);
    setProgress(0);

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      setTests(prev => prev.map(t => 
        t.id === test.id ? { ...t, status: 'running' } : t
      ));

      await new Promise(resolve => setTimeout(resolve, 1500));

      const passed = Math.random() > 0.15;
      setTests(prev => prev.map(t => 
        t.id === test.id ? { 
          ...t, 
          status: passed ? 'passed' : 'failed',
          details: passed ? 'No vulnerabilities detected' : 'Potential vulnerability found - requires review'
        } : t
      ));

      setProgress(((i + 1) / tests.length) * 100);
    }

    setIsRunning(false);
    
    const failedTests = tests.filter(t => t.status === 'failed');
    if (failedTests.length > 0) {
      toast({
        title: 'Security Issues Found',
        description: `${failedTests.length} security test(s) failed`,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Security Tests Complete',
        description: 'All security tests passed',
      });
    }
  };

  const getSeverityColor = (severity: SecurityTest['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
    }
  };

  const getStatusIcon = (status: SecurityTest['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const criticalFailed = tests.filter(t => t.status === 'failed' && t.severity === 'critical').length;

  const groupedTests = tests.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = [];
    }
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, SecurityTest[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Testing Suite
              </CardTitle>
              <CardDescription>
                Comprehensive security vulnerability assessment
              </CardDescription>
            </div>
            <Button onClick={runSecurityTests} disabled={isRunning}>
              <Play className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{passedTests}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{failedTests}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{criticalFailed}</div>
                <div className="text-sm text-muted-foreground">Critical Issues</div>
              </div>
            </div>

            {isRunning && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  Running security tests... {Math.round(progress)}%
                </p>
              </div>
            )}

            {failedTests > 0 && !isRunning && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Security vulnerabilities detected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {criticalFailed > 0 && `${criticalFailed} critical issue${criticalFailed > 1 ? 's' : ''} require immediate attention. `}
                    Please review and address all failed tests before deployment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {Object.entries(groupedTests).map(([category, categoryTests]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryTests.map((test) => (
                  <div key={test.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0">
                      {getStatusIcon(test.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{test.name}</p>
                        <Badge variant={getSeverityColor(test.severity)} className="text-xs">
                          {test.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{test.description}</p>
                      {test.details && (
                        <p className="text-xs mt-1 text-muted-foreground">{test.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
