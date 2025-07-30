import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accessibility, CheckCircle, AlertTriangle, Info, Play, Eye } from 'lucide-react';

interface AccessibilityTest {
  id: string;
  name: string;
  description: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  category: 'perceivable' | 'operable' | 'understandable' | 'robust';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  progress: number;
  score?: number;
  issues?: {
    type: 'error' | 'warning' | 'info';
    message: string;
    element?: string;
    suggestion: string;
  }[];
}

export function AccessibilityTester() {
  const [tests, setTests] = useState<AccessibilityTest[]>([
    {
      id: 'color-contrast',
      name: 'Color Contrast',
      description: 'Verify text has sufficient contrast against background',
      wcagLevel: 'AA',
      category: 'perceivable',
      status: 'pending',
      progress: 0
    },
    {
      id: 'keyboard-navigation',
      name: 'Keyboard Navigation',
      description: 'Ensure all interactive elements are keyboard accessible',
      wcagLevel: 'A',
      category: 'operable',
      status: 'pending',
      progress: 0
    },
    {
      id: 'screen-reader',
      name: 'Screen Reader Support',
      description: 'Validate proper ARIA labels and semantic markup',
      wcagLevel: 'A',
      category: 'perceivable',
      status: 'pending',
      progress: 0
    },
    {
      id: 'focus-management',
      name: 'Focus Management',
      description: 'Check focus indicators and logical tab order',
      wcagLevel: 'AA',
      category: 'operable',
      status: 'pending',
      progress: 0
    },
    {
      id: 'alt-text',
      name: 'Alternative Text',
      description: 'Verify all images have appropriate alt text',
      wcagLevel: 'A',
      category: 'perceivable',
      status: 'pending',
      progress: 0
    },
    {
      id: 'form-labels',
      name: 'Form Labels',
      description: 'Ensure all form inputs have proper labels',
      wcagLevel: 'A',
      category: 'understandable',
      status: 'pending',
      progress: 0
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallScore(null);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({
      ...test,
      status: 'running',
      progress: 0,
      score: undefined,
      issues: []
    })));

    // Simulate tests running
    const testDurations = Array(tests.length).fill(0).map(() => 2000 + Math.random() * 3000);
    
    tests.forEach((test, index) => {
      simulateTestExecution(test.id, testDurations[index]);
    });
  };

  const simulateTestExecution = async (testId: string, duration: number) => {
    const steps = 30;
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      setTests(prev => prev.map(test => {
        if (test.id === testId) {
          const progress = (i / steps) * 100;
          const isCompleted = i === steps;
          
          if (isCompleted) {
            // Simulate different outcomes
            const outcomes = ['passed', 'failed', 'warning'];
            const weights = [0.7, 0.1, 0.2]; // Higher chance of passing
            const randomValue = Math.random();
            let cumulativeWeight = 0;
            let status: AccessibilityTest['status'] = 'passed';
            
            for (let j = 0; j < outcomes.length; j++) {
              cumulativeWeight += weights[j];
              if (randomValue <= cumulativeWeight) {
                status = outcomes[j] as AccessibilityTest['status'];
                break;
              }
            }

            const score = status === 'passed' ? 
              90 + Math.random() * 10 : 
              status === 'warning' ? 
                75 + Math.random() * 15 : 
                Math.random() * 60;

            const issues = generateIssues(test, status);
            
            return {
              ...test,
              status,
              progress: 100,
              score: Math.round(score),
              issues
            };
          }
          
          return {
            ...test,
            progress
          };
        }
        return test;
      }));
    }
  };

  const generateIssues = (test: AccessibilityTest, status: AccessibilityTest['status']) => {
    if (status === 'passed') return [];
    
    const issueTemplates = {
      'color-contrast': [
        { type: 'error' as const, message: 'Text color #666 on background #fff has insufficient contrast ratio (3.2:1)', element: '.muted-text', suggestion: 'Use a darker color like #4a5568 for better contrast' },
        { type: 'warning' as const, message: 'Button text may be hard to read for users with color vision deficiencies', element: '.btn-secondary', suggestion: 'Consider using additional visual cues beyond color' }
      ],
      'keyboard-navigation': [
        { type: 'error' as const, message: 'Interactive element is not keyboard accessible', element: '.custom-dropdown', suggestion: 'Add tabindex and keyboard event handlers' },
        { type: 'warning' as const, message: 'Skip link is not provided for main content', element: 'body', suggestion: 'Add a skip navigation link for screen readers' }
      ],
      'screen-reader': [
        { type: 'error' as const, message: 'Button has no accessible name', element: '.icon-button', suggestion: 'Add aria-label or aria-labelledby attribute' },
        { type: 'warning' as const, message: 'Heading structure skips from h1 to h3', element: 'h3', suggestion: 'Use heading levels sequentially' }
      ],
      'focus-management': [
        { type: 'error' as const, message: 'Focus indicator is not visible', element: '.btn:focus', suggestion: 'Add visible focus outline with sufficient contrast' },
        { type: 'warning' as const, message: 'Modal does not trap focus properly', element: '.modal', suggestion: 'Implement focus trapping within modal dialogs' }
      ],
      'alt-text': [
        { type: 'error' as const, message: 'Image is missing alt text', element: 'img.hero-image', suggestion: 'Add descriptive alt text for the image content' },
        { type: 'warning' as const, message: 'Alt text is too generic', element: 'img.icon', suggestion: 'Make alt text more descriptive of the image purpose' }
      ],
      'form-labels': [
        { type: 'error' as const, message: 'Input field has no associated label', element: '#email-input', suggestion: 'Add a label element or aria-label attribute' },
        { type: 'warning' as const, message: 'Error messages are not programmatically associated', element: '.error-message', suggestion: 'Use aria-describedby to link error messages to inputs' }
      ]
    };

    const templates = issueTemplates[test.id as keyof typeof issueTemplates] || [];
    const numIssues = status === 'failed' ? Math.floor(Math.random() * 3) + 1 : 1;
    
    return templates.slice(0, numIssues);
  };

  const allCompleted = tests.every(test => 
    test.status === 'passed' || test.status === 'failed' || test.status === 'warning'
  );

  useEffect(() => {
    if (allCompleted && isRunning) {
      setIsRunning(false);
      
      // Calculate overall score
      const completedTests = tests.filter(test => test.score !== undefined);
      if (completedTests.length > 0) {
        const totalScore = completedTests.reduce((sum, test) => sum + (test.score || 0), 0);
        setOverallScore(Math.round(totalScore / completedTests.length));
      }
    }
  }, [allCompleted, isRunning, tests]);

  const getStatusIcon = (status: AccessibilityTest['status']) => {
    switch (status) {
      case 'running':
        return <Eye className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Accessibility className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: AccessibilityTest['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="text-blue-600">Testing</Badge>;
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

  const getCategoryColor = (category: AccessibilityTest['category']) => {
    const colors = {
      perceivable: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
      operable: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
      understandable: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
      robust: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200'
    };
    return colors[category];
  };

  const getWcagBadgeColor = (level: AccessibilityTest['wcagLevel']) => {
    const colors = {
      A: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
      AA: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
      AAA: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
    };
    return colors[level];
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      default:
        return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                WCAG Accessibility Testing
              </CardTitle>
              <CardDescription>
                Comprehensive accessibility audit against WCAG 2.1 guidelines
              </CardDescription>
            </div>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Accessibility Audit
            </Button>
          </div>
        </CardHeader>
        
        {allCompleted && overallScore !== null && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1 text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">{overallScore}%</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.status === 'passed').length}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Passed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {tests.filter(t => t.status === 'warning').length}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Warnings</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {tests.filter(t => t.status === 'failed').length}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tests.map((test) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            layout
          >
            <Card className={`h-full transition-all duration-300 ${
              test.status === 'running' ? 'ring-2 ring-blue-500/20' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <Badge className={`text-xs ${getWcagBadgeColor(test.wcagLevel)}`}>
                        WCAG {test.wcagLevel}
                      </Badge>
                    </div>
                    <CardDescription>{test.description}</CardDescription>
                    <Badge className={`text-xs mt-2 ${getCategoryColor(test.category)}`}>
                      {test.category.charAt(0).toUpperCase() + test.category.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                {test.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Testing...</span>
                      <span>{Math.round(test.progress)}%</span>
                    </div>
                    <Progress value={test.progress} className="h-2" />
                  </div>
                )}

                {/* Score */}
                {test.score !== undefined && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{test.score}%</div>
                    <div className="text-sm text-muted-foreground">Accessibility Score</div>
                  </div>
                )}

                {/* Issues */}
                {test.issues && test.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Issues Found:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {test.issues.map((issue, index) => (
                        <div key={index} className="text-xs p-2 rounded border-l-2 border-l-current space-y-1">
                          <div className="flex items-start gap-2">
                            {getIssueIcon(issue.type)}
                            <div className="flex-1">
                              <div className="font-medium">{issue.message}</div>
                              {issue.element && (
                                <div className="text-muted-foreground">Element: {issue.element}</div>
                              )}
                              <div className="text-muted-foreground italic">
                                Suggestion: {issue.suggestion}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}