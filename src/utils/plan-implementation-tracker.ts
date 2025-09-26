// Implementation Plan Progress Tracker

export interface PlanPhase {
  id: string;
  name: string;
  description: string;
  estimatedWeeks: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  tasks: PlanTask[];
}

export interface PlanTask {
  id: string;
  name: string;
  description: string;
  category: 'ui_ux' | 'mobile' | 'testing' | 'features' | 'backend' | 'performance';
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  dependencies?: string[];
  estimatedHours?: number;
  actualHours?: number;
  assignee?: string;
  files?: string[];
}

export const IMPLEMENTATION_PLAN: PlanPhase[] = [
  {
    id: 'phase1',
    name: 'Foundation & Core Infrastructure',
    description: 'UI/UX audit, mobile fixes, testing infrastructure',
    estimatedWeeks: '2-3 weeks',
    status: 'in_progress',
    progress: 75,
    tasks: [
      {
        id: 'text-audit',
        name: 'Text Justification & Copy Management',
        description: 'Review all user-facing text, implement centralized copy system',
        category: 'ui_ux',
        priority: 'high',
        status: 'completed',
        progress: 100,
        files: ['src/lib/constants/copy.ts']
      },
      {
        id: 'mobile-fixes',
        name: 'Mobile Bug Fixes & Optimization',
        description: 'Fix touch targets, navigation, keyboard handling',
        category: 'mobile',
        priority: 'high',
        status: 'completed',
        progress: 100,
        files: ['src/hooks/use-mobile.ts', 'src/styles/mobile.css']
      },
      {
        id: 'testing-infrastructure',
        name: 'Testing Infrastructure Enhancement',
        description: 'Unit tests, integration tests, E2E tests setup',
        category: 'testing',
        priority: 'high',
        status: 'completed',
        progress: 100,
        files: ['src/components/testing/ComprehensiveTestSuite.tsx']
      },
      {
        id: 'stellar-display',
        name: 'Stellar Address Display Innovation',
        description: 'Human-readable aliases, QR codes, memorable names',
        category: 'ui_ux',
        priority: 'medium',
        status: 'completed',
        progress: 100,
        files: ['src/utils/stellar-display.ts', 'src/components/ui/StellarAddressDisplay.tsx']
      }
    ]
  },
  {
    id: 'phase2',
    name: 'Core Feature Implementation',
    description: 'Wallet features, profile management, multi-user systems',
    estimatedWeeks: '3-4 weeks',
    status: 'in_progress',
    progress: 60,
    tasks: [
      {
        id: 'enhanced-wallet',
        name: 'Enhanced Wallet Features',
        description: 'Multi-currency support, analytics, transaction categorization',
        category: 'features',
        priority: 'high',
        status: 'completed',
        progress: 100,
        files: ['src/components/enhanced/EnhancedWallet.tsx']
      },
      {
        id: 'profile-management',
        name: 'Profile Management Overhaul',
        description: 'Enhanced profiles, verification levels, backup/recovery',
        category: 'features',
        priority: 'high',
        status: 'completed',
        progress: 100,
        files: ['src/components/profile/EnhancedProfileManager.tsx']
      },
      {
        id: 'multi-user-payments',
        name: 'Multi-User Payment System',
        description: 'Batch payments, dual authorization, approval workflows',
        category: 'features',
        priority: 'high',
        status: 'completed',
        progress: 100,
        files: ['src/components/payments/MultiUserPaymentSystem.tsx']
      },
      {
        id: 'performance-monitoring',
        name: 'Performance Monitoring',
        description: 'Core web vitals, load testing, performance analysis',
        category: 'performance',
        priority: 'medium',
        status: 'completed',
        progress: 100,
        files: ['src/components/performance/PerformanceAnalyzer.tsx']
      }
    ]
  },
  {
    id: 'phase3',
    name: 'Advanced Features',
    description: 'Backend features, performance optimization, security',
    estimatedWeeks: '2-3 weeks',
    status: 'completed',
    progress: 100,
    tasks: [
      {
        id: 'exchange-rates',
        name: 'Real-time Exchange Rate Feeds',
        description: 'Implement live exchange rate API integration',
        category: 'backend',
        priority: 'high',
        status: 'completed',
        progress: 100,
        files: ['src/services/ExchangeRateService.ts']
      },
      {
        id: 'fee-calculation',
        name: 'Advanced Fee Calculation Engine',
        description: 'Dynamic fee calculation based on network conditions',
        category: 'backend',
        priority: 'medium',
        status: 'completed',
        progress: 100,
        files: ['src/services/FeeCalculationService.ts']
      },
      {
        id: 'monitoring-alerts',
        name: 'Transaction Monitoring & Alerts',
        description: 'Real-time transaction monitoring and alert system',
        category: 'backend',
        priority: 'medium',
        status: 'completed',
        progress: 100,
        files: ['src/services/TransactionMonitoringService.ts']
      },
      {
        id: 'code-splitting',
        name: 'Code Splitting & Bundle Optimization',
        description: 'Route-level code splitting, tree shaking, bundle size optimization',
        category: 'performance',
        priority: 'high',
        status: 'completed',
        progress: 100,
        files: ['src/components/performance/CodeSplittingOptimizer.tsx']
      },
      {
        id: 'offline-functionality',
        name: 'Offline Functionality',
        description: 'Service worker implementation for offline support',
        category: 'performance',
        priority: 'medium',
        status: 'completed',
        progress: 100,
        files: ['src/components/performance/OfflineFunctionality.tsx']
      }
    ]
  },
  {
    id: 'phase4',
    name: 'Testing & Quality Assurance',
    description: 'Comprehensive testing, performance testing, security testing',
    estimatedWeeks: '2 weeks',
    status: 'not_started',
    progress: 0,
    tasks: [
      {
        id: 'e2e-testing',
        name: 'End-to-End Testing Implementation',
        description: 'Complete user journey testing with Playwright/Cypress',
        category: 'testing',
        priority: 'high',
        status: 'not_started',
        progress: 0
      },
      {
        id: 'load-testing',
        name: 'Load Testing for Scale',
        description: 'Test application under 1M+ daily users load',
        category: 'testing',
        priority: 'high',
        status: 'not_started',
        progress: 0
      },
      {
        id: 'security-testing',
        name: 'Security Testing Suite',
        description: 'Penetration testing, data encryption verification',
        category: 'testing',
        priority: 'high',
        status: 'not_started',
        progress: 0
      },
      {
        id: 'mobile-testing',
        name: 'Mobile Performance Testing',
        description: 'Device-specific testing, performance benchmarking',
        category: 'testing',
        priority: 'medium',
        status: 'not_started',
        progress: 0
      }
    ]
  },
  {
    id: 'phase5',
    name: 'Polish & Production Readiness',
    description: 'Final polish, performance verification, content review',
    estimatedWeeks: '1-2 weeks',
    status: 'not_started',
    progress: 0,
    tasks: [
      {
        id: 'ui-polish',
        name: 'Final UI/UX Polish',
        description: 'Review interactions, visual hierarchy, loading states',
        category: 'ui_ux',
        priority: 'medium',
        status: 'not_started',
        progress: 0
      },
      {
        id: 'performance-audit',
        name: 'Final Performance Audit',
        description: 'Database optimization, CDN setup, caching implementation',
        category: 'performance',
        priority: 'high',
        status: 'not_started',
        progress: 0
      },
      {
        id: 'content-review',
        name: 'Professional Content Review',
        description: 'Copywriting review, legal compliance, multi-language prep',
        category: 'ui_ux',
        priority: 'medium',
        status: 'not_started',
        progress: 0
      },
      {
        id: 'scalability-verification',
        name: 'Scalability Verification',
        description: 'Final stress testing and scalability validation',
        category: 'testing',
        priority: 'high',
        status: 'not_started',
        progress: 0
      }
    ]
  }
];

export function getOverallProgress(): number {
  const totalTasks = IMPLEMENTATION_PLAN.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const completedTasks = IMPLEMENTATION_PLAN.reduce(
    (sum, phase) => sum + phase.tasks.filter(task => task.status === 'completed').length, 
    0
  );
  return Math.round((completedTasks / totalTasks) * 100);
}

export function getPhaseProgress(phaseId: string): number {
  const phase = IMPLEMENTATION_PLAN.find(p => p.id === phaseId);
  if (!phase) return 0;
  
  const totalTasks = phase.tasks.length;
  const completedTasks = phase.tasks.filter(task => task.status === 'completed').length;
  return Math.round((completedTasks / totalTasks) * 100);
}

export function getTasksByCategory(category: PlanTask['category']): PlanTask[] {
  return IMPLEMENTATION_PLAN.flatMap(phase => 
    phase.tasks.filter(task => task.category === category)
  );
}

export function getTasksByStatus(status: PlanTask['status']): PlanTask[] {
  return IMPLEMENTATION_PLAN.flatMap(phase => 
    phase.tasks.filter(task => task.status === status)
  );
}

export function updateTaskStatus(taskId: string, status: PlanTask['status']): void {
  for (const phase of IMPLEMENTATION_PLAN) {
    const task = phase.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.progress = status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0;
      
      // Update phase progress
      phase.progress = getPhaseProgress(phase.id);
      
      // Update phase status based on tasks
      const allCompleted = phase.tasks.every(t => t.status === 'completed');
      const someInProgress = phase.tasks.some(t => t.status === 'in_progress');
      
      if (allCompleted) {
        phase.status = 'completed';
      } else if (someInProgress) {
        phase.status = 'in_progress';
      } else {
        phase.status = 'not_started';
      }
      
      break;
    }
  }
}

export function getNextTasks(limit = 5): PlanTask[] {
  const notStartedTasks = getTasksByStatus('not_started');
  const inProgressTasks = getTasksByStatus('in_progress');
  
  return [...inProgressTasks, ...notStartedTasks].slice(0, limit);
}

export function getCompletedFilesCount(): number {
  const completedTasks = getTasksByStatus('completed');
  return completedTasks.reduce((sum, task) => sum + (task.files?.length || 0), 0);
}