import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, ArrowRight, CheckCircle, AlertTriangle, Clock, Play, Eye } from 'lucide-react';

interface UserFlow {
  id: string;
  name: string;
  description: string;
  steps: string[];
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  progress: number;
  duration?: number;
  issues?: string[];
  successRate?: number;
}

export function UserFlowValidator() {
  const [flows, setFlows] = useState<UserFlow[]>([
    {
      id: 'onboarding',
      name: 'User Onboarding',
      description: 'Complete user registration and profile setup',
      steps: [
        'Navigate to signup page',
        'Fill registration form',
        'Verify email',
        'Complete profile setup',
        'Enable 2FA'
      ],
      status: 'pending',
      progress: 0
    },
    {
      id: 'payment-flow',
      name: 'Payment Processing',
      description: 'End-to-end payment flow validation',
      steps: [
        'Login to account',
        'Navigate to payments',
        'Select recipient',
        'Enter amount and details',
        'Complete payment'
      ],
      status: 'pending',
      progress: 0
    },
    {
      id: 'profile-management',
      name: 'Profile Management',
      description: 'User profile and settings management',
      steps: [
        'Access profile page',
        'Update personal information',
        'Change password',
        'Update notification preferences',
        'Save changes'
      ],
      status: 'pending',
      progress: 0
    },
    {
      id: 'transaction-history',
      name: 'Transaction History',
      description: 'View and manage transaction history',
      steps: [
        'Navigate to dashboard',
        'Access transaction history',
        'Filter transactions',
        'View transaction details',
        'Export transaction data'
      ],
      status: 'pending',
      progress: 0
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const runAllFlows = async () => {
    setIsRunning(true);
    
    // Reset all flows
    setFlows(prev => prev.map(flow => ({
      ...flow,
      status: 'running',
      progress: 0,
      duration: undefined,
      issues: [],
      successRate: undefined
    })));

    // Simulate flows running with different completion times
    const flowDurations = [4000, 5000, 3500, 3000];
    
    flows.forEach((flow, index) => {
      simulateFlowExecution(flow.id, flowDurations[index]);
    });
  };

  const simulateFlowExecution = async (flowId: string, duration: number) => {
    const steps = 50;
    const stepDuration = duration / steps;
    const startTime = Date.now();
    
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      setFlows(prev => prev.map(flow => {
        if (flow.id === flowId) {
          const progress = (i / steps) * 100;
          const isCompleted = i === steps;
          
          if (isCompleted) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Simulate different outcomes
            const outcomes = ['passed', 'failed', 'warning'];
            const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            const status = randomOutcome as UserFlow['status'];
            
            const issues = status === 'failed' ? [
              'Form validation error detected',
              'Network timeout on step 3'
            ] : status === 'warning' ? [
              'Slow response time on step 2'
            ] : [];

            const successRate = status === 'passed' ? 
              95 + Math.random() * 5 : 
              status === 'warning' ? 
                85 + Math.random() * 10 : 
                Math.random() * 60;
            
            return {
              ...flow,
              status,
              progress: 100,
              duration,
              issues,
              successRate: Math.round(successRate)
            };
          }
          
          return {
            ...flow,
            progress
          };
        }
        return flow;
      }));
    }
  };

  const runSingleFlow = (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    if (flow && flow.status === 'pending') {
      simulateFlowExecution(flowId, 4000);
    }
  };

  const allCompleted = flows.every(flow => 
    flow.status === 'passed' || flow.status === 'failed' || flow.status === 'warning'
  );

  useEffect(() => {
    if (allCompleted && isRunning) {
      setIsRunning(false);
    }
  }, [allCompleted, isRunning]);

  const getStatusIcon = (status: UserFlow['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Eye className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: UserFlow['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="text-blue-600">Running</Badge>;
      case 'passed':
        return <Badge variant="secondary" className="text-green-600">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="text-yellow-600">Warning</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getSuccessRateColor = (rate?: number) => {
    if (!rate) return 'text-muted-foreground';
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Flow Validation
              </CardTitle>
              <CardDescription>
                End-to-end testing of critical user journeys
              </CardDescription>
            </div>
            <Button
              onClick={runAllFlows}
              disabled={isRunning}
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Run All Flows
            </Button>
          </div>
        </CardHeader>
        
        {allCompleted && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {flows.filter(f => f.status === 'passed').length}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Passed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {flows.filter(f => f.status === 'warning').length}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Warnings</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {flows.filter(f => f.status === 'failed').length}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* User Flows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {flows.map((flow) => (
          <motion.div
            key={flow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            layout
          >
            <Card className={`h-full transition-all duration-300 ${
              flow.status === 'running' ? 'ring-2 ring-blue-500/20' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{flow.name}</CardTitle>
                    <CardDescription>{flow.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(flow.status)}
                    {getStatusBadge(flow.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                {flow.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(flow.progress)}%</span>
                    </div>
                    <Progress value={flow.progress} className="h-2" />
                  </div>
                )}

                {/* Steps */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Flow Steps:</h4>
                  <div className="space-y-1">
                    {flow.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-xs">{index + 1}.</span>
                        <span>{step}</span>
                        {index < flow.steps.length - 1 && (
                          <ArrowRight className="h-3 w-3 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results */}
                {(flow.status === 'passed' || flow.status === 'failed' || flow.status === 'warning') && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <div className="font-medium">{flow.duration}ms</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <div className={`font-medium ${getSuccessRateColor(flow.successRate)}`}>
                          {flow.successRate}%
                        </div>
                      </div>
                    </div>

                    {flow.issues && flow.issues.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-red-600">Issues Found:</span>
                        {flow.issues.map((issue, index) => (
                          <div key={index} className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                            {issue}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => runSingleFlow(flow.id)}
                  disabled={flow.status === 'running' || isRunning}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {flow.status === 'running' ? 'Running...' : 'Run Flow'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}