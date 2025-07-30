import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, Brain, Eye, Zap, Shield, AlertTriangle, CheckCircle, Clock, Play, Pause } from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  findings: number;
  criticalIssues: number;
  lastRun?: Date;
}

interface AITestOrchestratorProps {
  isRunning?: boolean;
}

export function AITestOrchestrator({ isRunning = false }: AITestOrchestratorProps) {
  const [agents, setAgents] = useState<AIAgent[]>([
    {
      id: 'ui-ux-agent',
      name: 'UI/UX Flow Agent',
      description: 'Simulates real user interactions and validates user journeys',
      icon: Eye,
      status: 'idle',
      progress: 0,
      findings: 0,
      criticalIssues: 0
    },
    {
      id: 'performance-agent',
      name: 'Performance Agent',
      description: 'Monitors performance metrics and detects regressions',
      icon: Zap,
      status: 'idle',
      progress: 0,
      findings: 0,
      criticalIssues: 0
    },
    {
      id: 'accessibility-agent',
      name: 'Accessibility Agent',
      description: 'Ensures WCAG compliance and inclusive design',
      icon: Shield,
      status: 'idle',
      progress: 0,
      findings: 0,
      criticalIssues: 0
    },
    {
      id: 'bug-detection-agent',
      name: 'Bug Detection Agent',
      description: 'Analyzes patterns and identifies potential bugs',
      icon: Brain,
      status: 'idle',
      progress: 0,
      findings: 0,
      criticalIssues: 0
    }
  ]);

  const [orchestratorStatus, setOrchestratorStatus] = useState<'idle' | 'running' | 'paused'>('idle');

  useEffect(() => {
    if (isRunning && orchestratorStatus === 'idle') {
      startAllAgents();
    }
  }, [isRunning]);

  const startAllAgents = async () => {
    setOrchestratorStatus('running');
    
    // Reset all agents
    setAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'running',
      progress: 0,
      findings: 0,
      criticalIssues: 0
    })));

    // Simulate agents running with different completion times
    const agentDurations = [3000, 4500, 3500, 5000]; // milliseconds
    
    agents.forEach((agent, index) => {
      simulateAgentExecution(agent.id, agentDurations[index]);
    });
  };

  const simulateAgentExecution = async (agentId: string, duration: number) => {
    const steps = 20;
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? {
              ...agent,
              progress: (i / steps) * 100,
              findings: Math.floor(Math.random() * 15) + 1,
              criticalIssues: Math.floor(Math.random() * 3),
              status: i === steps ? 'completed' : 'running',
              lastRun: i === steps ? new Date() : agent.lastRun
            }
          : agent
      ));
    }
  };

  const startSingleAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent && agent.status === 'idle') {
      simulateAgentExecution(agentId, 3000);
    }
  };

  const pauseOrchestrator = () => {
    setOrchestratorStatus(orchestratorStatus === 'paused' ? 'running' : 'paused');
  };

  const getStatusIcon = (status: AIAgent['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bot className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: AIAgent['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="text-blue-600">Running</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="text-green-600">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  const allCompleted = agents.every(agent => agent.status === 'completed');
  const anyRunning = agents.some(agent => agent.status === 'running');

  return (
    <div className="space-y-6">
      {/* Orchestrator Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Test Orchestrator
              </CardTitle>
              <CardDescription>
                Intelligent agents working together to validate your application
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {anyRunning && (
                <Button
                  onClick={pauseOrchestrator}
                  variant="outline"
                  size="sm"
                >
                  {orchestratorStatus === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              )}
              <Button
                onClick={startAllAgents}
                disabled={anyRunning}
                size="sm"
              >
                <Bot className="h-4 w-4 mr-2" />
                Deploy All Agents
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {allCompleted && (
          <CardContent>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  All agents have completed their analysis
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Total findings: {agents.reduce((sum, agent) => sum + agent.findings, 0)} | 
                Critical issues: {agents.reduce((sum, agent) => sum + agent.criticalIssues, 0)}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* AI Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {agents.map((agent) => {
            const IconComponent = agent.icon;
            
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <Card className={`transition-all duration-300 ${
                  agent.status === 'running' ? 'ring-2 ring-blue-500/20' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {agent.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(agent.status)}
                        {getStatusBadge(agent.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    {agent.status === 'running' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(agent.progress)}%</span>
                        </div>
                        <Progress value={agent.progress} className="h-2" />
                      </div>
                    )}

                    {/* Results */}
                    {agent.status === 'completed' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="text-lg font-semibold text-blue-600">{agent.findings}</div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">Findings</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                          <div className="text-lg font-semibold text-red-600">{agent.criticalIssues}</div>
                          <div className="text-xs text-red-700 dark:text-red-300">Critical</div>
                        </div>
                      </div>
                    )}

                    {/* Last Run */}
                    {agent.lastRun && (
                      <div className="text-xs text-muted-foreground">
                        Last run: {agent.lastRun.toLocaleString()}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => startSingleAgent(agent.id)}
                      disabled={agent.status === 'running' || anyRunning}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {agent.status === 'running' ? 'Running...' : 'Run Agent'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}