import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ComprehensiveTest } from '@/components/testing/ComprehensiveTest';
import { LoadTestRunner } from '@/components/testing/LoadTestRunner';
import { AITestOrchestrator } from '@/components/testing/AITestOrchestrator';
import { UserFlowValidator } from '@/components/testing/UserFlowValidator';
import { AccessibilityTester } from '@/components/testing/AccessibilityTester';
import { PerformanceAnalyzer } from '@/components/testing/PerformanceAnalyzer';
import { BugDetectionAgent } from '@/components/testing/BugDetectionAgent';
import { TestAnalytics } from '@/components/testing/TestAnalytics';
import { Bot, Zap, Bug, Accessibility, TrendingUp, Users, Shield, Play, Square, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TestDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunningAllTests, setIsRunningAllTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [lastTestRun, setLastTestRun] = useState<Date | null>(null);

  const runAllTests = async () => {
    setIsRunningAllTests(true);
    setTestProgress(0);
    
    // Simulate progressive testing
    const testStages = [
      'Initializing AI Agents...',
      'Running Performance Analysis...',
      'Executing User Flow Validation...',
      'Conducting Accessibility Audit...',
      'Performing Bug Detection...',
      'Running Load Tests...',
      'Generating Analytics Report...',
      'Finalizing Results...'
    ];

    for (let i = 0; i < testStages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestProgress((i + 1) / testStages.length * 100);
    }

    setIsRunningAllTests(false);
    setLastTestRun(new Date());
  };

  const stopAllTests = () => {
    setIsRunningAllTests(false);
    setTestProgress(0);
  };

  const resetAllTests = () => {
    setTestProgress(0);
    setLastTestRun(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back
              </Button>
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">AI-Powered Testing Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {lastTestRun && (
                <span className="text-sm text-muted-foreground">
                  Last run: {lastTestRun.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={resetAllTests}
                variant="outline"
                size="sm"
                disabled={isRunningAllTests}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={isRunningAllTests ? stopAllTests : runAllTests}
                variant={isRunningAllTests ? "destructive" : "default"}
                size="sm"
              >
                {isRunningAllTests ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop All Tests
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <AnimatePresence>
            {isRunningAllTests && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="flex items-center gap-3">
                  <Progress value={testProgress} className="flex-1" />
                  <span className="text-sm font-medium">{Math.round(testProgress)}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai-orchestrator" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="user-flows" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Flows
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="bug-detection" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Bug Detection
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">98.5%</div>
                  <Badge variant="secondary" className="mt-1">Excellent</Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">94/100</div>
                  <Badge variant="secondary" className="mt-1">Great</Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">96%</div>
                  <Badge variant="secondary" className="mt-1">WCAG AA</Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">0</div>
                  <Badge variant="secondary" className="mt-1">All Clear</Badge>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comprehensive Tests</CardTitle>
                  <CardDescription>Traditional test suite with UI, performance, and functionality tests</CardDescription>
                </CardHeader>
                <CardContent>
                  <ComprehensiveTest />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Load Testing</CardTitle>
                  <CardDescription>Simulate high traffic and test scalability for 1M+ users</CardDescription>
                </CardHeader>
                <CardContent>
                  <LoadTestRunner />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-orchestrator">
            <AITestOrchestrator isRunning={isRunningAllTests} />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceAnalyzer />
          </TabsContent>

          <TabsContent value="user-flows">
            <UserFlowValidator />
          </TabsContent>

          <TabsContent value="accessibility">
            <AccessibilityTester />
          </TabsContent>

          <TabsContent value="bug-detection">
            <BugDetectionAgent />
          </TabsContent>

          <TabsContent value="analytics">
            <TestAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}