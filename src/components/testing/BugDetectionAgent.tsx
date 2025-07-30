import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bug, Brain, AlertTriangle, CheckCircle, Code, Database, Wifi, Shield, Play, Search } from 'lucide-react';

interface BugPattern {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'security' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  icon: React.ComponentType<any>;
  status: 'pending' | 'scanning' | 'completed';
  progress: number;
  findings?: {
    file: string;
    line: number;
    issue: string;
    suggestion: string;
    confidence: number;
  }[];
}

export function BugDetectionAgent() {
  const [patterns, setPatterns] = useState<BugPattern[]>([
    {
      id: 'memory-leaks',
      name: 'Memory Leaks',
      description: 'Detect potential memory leaks and unreferenced objects',
      category: 'performance',
      severity: 'high',
      icon: Brain,
      status: 'pending',
      progress: 0
    },
    {
      id: 'null-references',
      name: 'Null Reference Errors',
      description: 'Identify potential null/undefined access patterns',
      category: 'frontend',
      severity: 'medium',
      icon: Code,
      status: 'pending',
      progress: 0
    },
    {
      id: 'async-race-conditions',
      name: 'Race Conditions',
      description: 'Detect async operations that may cause race conditions',
      category: 'frontend',
      severity: 'high',
      icon: Database,
      status: 'pending',
      progress: 0
    },
    {
      id: 'security-vulnerabilities',
      name: 'Security Vulnerabilities',
      description: 'Scan for common security anti-patterns',
      category: 'security',
      severity: 'critical',
      icon: Shield,
      status: 'pending',
      progress: 0
    },
    {
      id: 'api-error-handling',
      name: 'API Error Handling',
      description: 'Validate proper error handling in API calls',
      category: 'backend',
      severity: 'medium',
      icon: Wifi,
      status: 'pending',
      progress: 0
    },
    {
      id: 'performance-bottlenecks',
      name: 'Performance Bottlenecks',
      description: 'Identify code patterns that may cause performance issues',
      category: 'performance',
      severity: 'medium',
      icon: Brain,
      status: 'pending',
      progress: 0
    }
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [totalFindings, setTotalFindings] = useState(0);

  const startScan = async () => {
    setIsScanning(true);
    setTotalFindings(0);
    
    // Reset all patterns
    setPatterns(prev => prev.map(pattern => ({
      ...pattern,
      status: 'scanning',
      progress: 0,
      findings: []
    })));

    // Simulate scanning with different durations
    const scanDurations = Array(patterns.length).fill(0).map(() => 2000 + Math.random() * 4000);
    
    patterns.forEach((pattern, index) => {
      simulatePatternScan(pattern.id, scanDurations[index]);
    });
  };

  const simulatePatternScan = async (patternId: string, duration: number) => {
    const steps = 40;
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      setPatterns(prev => prev.map(pattern => {
        if (pattern.id === patternId) {
          const progress = (i / steps) * 100;
          const isCompleted = i === steps;
          
          if (isCompleted) {
            const findings = generateFindings(pattern);
            
            return {
              ...pattern,
              status: 'completed',
              progress: 100,
              findings
            };
          }
          
          return {
            ...pattern,
            progress
          };
        }
        return pattern;
      }));
    }
  };

  const generateFindings = (pattern: BugPattern) => {
    const findingsTemplates = {
      'memory-leaks': [
        { file: 'components/Dashboard.tsx', line: 45, issue: 'Event listener not removed in cleanup', suggestion: 'Add removeEventListener in useEffect cleanup', confidence: 85 },
        { file: 'hooks/useWebSocket.ts', line: 23, issue: 'WebSocket connection not properly closed', suggestion: 'Ensure connection is closed in component unmount', confidence: 92 }
      ],
      'null-references': [
        { file: 'components/UserProfile.tsx', line: 67, issue: 'Accessing property of potentially null object', suggestion: 'Add null check or use optional chaining', confidence: 78 },
        { file: 'utils/dataProcessor.ts', line: 34, issue: 'Array method called on potentially undefined value', suggestion: 'Validate array exists before calling methods', confidence: 88 }
      ],
      'async-race-conditions': [
        { file: 'hooks/useAuth.ts', line: 89, issue: 'State update after component unmount', suggestion: 'Use cleanup flag to prevent state updates', confidence: 91 },
        { file: 'services/ApiService.ts', line: 156, issue: 'Concurrent API calls may overwrite state', suggestion: 'Implement request cancellation or debouncing', confidence: 76 }
      ],
      'security-vulnerabilities': [
        { file: 'components/PaymentForm.tsx', line: 23, issue: 'Sensitive data logged to console', suggestion: 'Remove or sanitize console.log statements', confidence: 95 },
        { file: 'utils/storage.ts', line: 12, issue: 'Storing sensitive data in localStorage', suggestion: 'Use secure storage or encrypt sensitive data', confidence: 82 }
      ],
      'api-error-handling': [
        { file: 'hooks/usePayments.ts', line: 45, issue: 'API error not properly handled', suggestion: 'Add comprehensive error handling and user feedback', confidence: 87 },
        { file: 'services/TransactionService.ts', line: 78, issue: 'Network errors not caught', suggestion: 'Implement retry logic and error boundaries', confidence: 79 }
      ],
      'performance-bottlenecks': [
        { file: 'components/TransactionList.tsx', line: 123, issue: 'Expensive computation in render loop', suggestion: 'Move calculation to useMemo hook', confidence: 84 },
        { file: 'hooks/useTransactionFilter.ts', line: 56, issue: 'Missing dependency optimization', suggestion: 'Optimize useEffect dependencies', confidence: 71 }
      ]
    };

    const templates = findingsTemplates[pattern.id as keyof typeof findingsTemplates] || [];
    const numFindings = Math.floor(Math.random() * 3); // 0-2 findings per pattern
    
    return templates.slice(0, numFindings);
  };

  const allCompleted = patterns.every(pattern => pattern.status === 'completed');

  useEffect(() => {
    if (allCompleted && isScanning) {
      setIsScanning(false);
      
      // Calculate total findings
      const total = patterns.reduce((sum, pattern) => 
        sum + (pattern.findings?.length || 0), 0
      );
      setTotalFindings(total);
    }
  }, [allCompleted, isScanning, patterns]);

  const getSeverityColor = (severity: BugPattern['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-950/20';
      case 'high':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const getCategoryColor = (category: BugPattern['category']) => {
    const colors = {
      frontend: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
      backend: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
      security: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
      performance: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
    };
    return colors[category];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
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
                <Bug className="h-5 w-5" />
                AI Bug Detection Agent
              </CardTitle>
              <CardDescription>
                Intelligent pattern analysis to identify potential bugs and issues
              </CardDescription>
            </div>
            <Button
              onClick={startScan}
              disabled={isScanning}
              size="sm"
            >
              <Search className="h-4 w-4 mr-2" />
              Start Deep Scan
            </Button>
          </div>
        </CardHeader>
        
        {allCompleted && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalFindings}</div>
                <div className="text-sm text-muted-foreground">Total Issues Found</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {patterns.filter(p => p.severity === 'critical').reduce((sum, p) => sum + (p.findings?.length || 0), 0)}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Critical</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {patterns.filter(p => p.severity === 'high').reduce((sum, p) => sum + (p.findings?.length || 0), 0)}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">High</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {patterns.filter(p => p.severity === 'medium' || p.severity === 'low').reduce((sum, p) => sum + (p.findings?.length || 0), 0)}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Medium/Low</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bug Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patterns.map((pattern) => {
          const IconComponent = pattern.icon;
          
          return (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              <Card className={`h-full transition-all duration-300 ${
                pattern.status === 'scanning' ? 'ring-2 ring-blue-500/20' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(pattern.severity)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{pattern.name}</CardTitle>
                          <Badge className={`text-xs ${getCategoryColor(pattern.category)}`}>
                            {pattern.category}
                          </Badge>
                        </div>
                        <CardDescription>{pattern.description}</CardDescription>
                        <Badge variant="outline" className={`mt-2 text-xs ${getSeverityColor(pattern.severity)}`}>
                          {pattern.severity.toUpperCase()} SEVERITY
                        </Badge>
                      </div>
                    </div>
                    {pattern.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  {pattern.status === 'scanning' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Scanning...</span>
                        <span>{Math.round(pattern.progress)}%</span>
                      </div>
                      <Progress value={pattern.progress} className="h-2" />
                    </div>
                  )}

                  {/* Findings */}
                  {pattern.status === 'completed' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Issues Found: {pattern.findings?.length || 0}
                        </span>
                        {(pattern.findings?.length || 0) === 0 && (
                          <Badge variant="secondary" className="text-green-600">Clean</Badge>
                        )}
                      </div>

                      {pattern.findings && pattern.findings.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {pattern.findings.map((finding, index) => (
                            <div key={index} className="text-xs p-3 border rounded-lg space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-foreground">{finding.issue}</div>
                                  <div className="text-muted-foreground mt-1">
                                    {finding.file}:{finding.line}
                                  </div>
                                </div>
                                <div className={`text-xs font-medium ${getConfidenceColor(finding.confidence)}`}>
                                  {finding.confidence}% confidence
                                </div>
                              </div>
                              <div className="text-muted-foreground italic">
                                💡 {finding.suggestion}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}