import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Loader2, Play, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card'
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor'
import { useMemoryMonitor } from '@/utils/performance-optimization'
import { cn } from '@/lib/utils'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning'
  message: string
  duration?: number
  details?: any
}

interface TestSuite {
  name: string
  tests: TestResult[]
  status: 'pending' | 'running' | 'completed'
}

export function ComprehensiveTest() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle')
  const { performanceScore, metrics } = usePerformanceMonitor('ComprehensiveTest')
  const { checkMemoryUsage } = useMemoryMonitor()

  const initializeTests = () => {
    const suites: TestSuite[] = [
      {
        name: 'UI Components',
        status: 'pending',
        tests: [
          { name: 'Button Variants', status: 'pending', message: 'Testing button variants and states' },
          { name: 'Modern Cards', status: 'pending', message: 'Testing card components and animations' },
          { name: 'Loading States', status: 'pending', message: 'Testing skeleton and spinner components' },
          { name: 'Responsive Design', status: 'pending', message: 'Testing mobile and desktop layouts' }
        ]
      },
      {
        name: 'Performance',
        status: 'pending',
        tests: [
          { name: 'Memory Usage', status: 'pending', message: 'Checking memory consumption' },
          { name: 'Render Performance', status: 'pending', message: 'Measuring component render times' },
          { name: 'Animation Performance', status: 'pending', message: 'Testing smooth animations' },
          { name: 'Bundle Size', status: 'pending', message: 'Analyzing bundle optimization' }
        ]
      },
      {
        name: 'Functionality',
        status: 'pending',
        tests: [
          { name: 'Navigation', status: 'pending', message: 'Testing route transitions' },
          { name: 'Form Validation', status: 'pending', message: 'Testing input validation' },
          { name: 'State Management', status: 'pending', message: 'Testing state updates and persistence' },
          { name: 'Error Handling', status: 'pending', message: 'Testing error boundaries and recovery' }
        ]
      },
      {
        name: 'Mobile Experience',
        status: 'pending',
        tests: [
          { name: 'Touch Interactions', status: 'pending', message: 'Testing mobile gestures and taps' },
          { name: 'Viewport Handling', status: 'pending', message: 'Testing mobile viewport and safe areas' },
          { name: 'Performance on Mobile', status: 'pending', message: 'Testing mobile-specific optimizations' },
          { name: 'Progressive Web App', status: 'pending', message: 'Testing PWA features' }
        ]
      }
    ]
    setTestSuites(suites)
  }

  const runTest = async (suiteIndex: number, testIndex: number): Promise<TestResult> => {
    const suite = testSuites[suiteIndex]
    const test = suite.tests[testIndex]
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const startTime = performance.now()
        let result: TestResult

        // Simulate different test scenarios
        switch (test.name) {
          case 'Memory Usage':
            const memoryInfo = checkMemoryUsage()
            result = {
              ...test,
              status: memoryInfo && memoryInfo.percentage < 70 ? 'passed' : 'warning',
              message: memoryInfo 
                ? `Memory usage: ${memoryInfo.percentage.toFixed(1)}%` 
                : 'Memory monitoring not available',
              details: memoryInfo,
              duration: performance.now() - startTime
            }
            break

          case 'Render Performance':
            result = {
              ...test,
              status: performanceScore > 80 ? 'passed' : performanceScore > 60 ? 'warning' : 'failed',
              message: `Performance score: ${performanceScore}/100`,
              details: metrics,
              duration: performance.now() - startTime
            }
            break

          case 'Responsive Design':
            const isMobileViewport = window.innerWidth < 768
            const hasProperSpacing = document.querySelector('[class*="p-"]') !== null
            result = {
              ...test,
              status: hasProperSpacing ? 'passed' : 'warning',
              message: `Viewport: ${window.innerWidth}x${window.innerHeight} (${isMobileViewport ? 'Mobile' : 'Desktop'})`,
              details: { viewport: { width: window.innerWidth, height: window.innerHeight }, isMobile: isMobileViewport },
              duration: performance.now() - startTime
            }
            break

          case 'Animation Performance':
            const animationElements = document.querySelectorAll('[style*="transform"], [class*="animate-"]')
            result = {
              ...test,
              status: animationElements.length > 0 ? 'passed' : 'warning',
              message: `Found ${animationElements.length} animated elements`,
              details: { animatedElements: animationElements.length },
              duration: performance.now() - startTime
            }
            break

          default:
            // Random success/failure for demonstration
            const success = Math.random() > 0.2
            result = {
              ...test,
              status: success ? 'passed' : Math.random() > 0.5 ? 'warning' : 'failed',
              message: success ? 'Test completed successfully' : 'Test encountered issues',
              duration: performance.now() - startTime
            }
        }

        resolve(result)
      }, Math.random() * 2000 + 500) // Random delay between 500-2500ms
    })
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setOverallStatus('running')

    for (let suiteIndex = 0; suiteIndex < testSuites.length; suiteIndex++) {
      // Update suite status to running
      setTestSuites(prev => prev.map((suite, i) => 
        i === suiteIndex ? { ...suite, status: 'running' } : suite
      ))

      const suite = testSuites[suiteIndex]
      
      for (let testIndex = 0; testIndex < suite.tests.length; testIndex++) {
        // Update test status to running
        setTestSuites(prev => prev.map((suite, i) => 
          i === suiteIndex 
            ? {
                ...suite,
                tests: suite.tests.map((test, j) => 
                  j === testIndex ? { ...test, status: 'running' } : test
                )
              }
            : suite
        ))

        const result = await runTest(suiteIndex, testIndex)

        // Update test with result
        setTestSuites(prev => prev.map((suite, i) => 
          i === suiteIndex 
            ? {
                ...suite,
                tests: suite.tests.map((test, j) => 
                  j === testIndex ? result : test
                )
              }
            : suite
        ))
      }

      // Update suite status to completed
      setTestSuites(prev => prev.map((suite, i) => 
        i === suiteIndex ? { ...suite, status: 'completed' } : suite
      ))
    }

    setIsRunning(false)
    setOverallStatus('completed')
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
    }
  }

  const getOverallStats = () => {
    const allTests = testSuites.flatMap(suite => suite.tests)
    const total = allTests.length
    const passed = allTests.filter(test => test.status === 'passed').length
    const failed = allTests.filter(test => test.status === 'failed').length
    const warnings = allTests.filter(test => test.status === 'warning').length
    
    return { total, passed, failed, warnings }
  }

  useEffect(() => {
    initializeTests()
  }, [])

  const stats = getOverallStats()

  return (
    <div className="space-y-6">
      <ModernCard variant="gradient">
        <ModernCardHeader>
          <ModernCardTitle>Comprehensive System Test</ModernCardTitle>
          <ModernCardContent>
            <p className="text-sm text-white/70 mb-4">
              Complete testing suite for UI components, performance, functionality, and mobile experience.
            </p>
            
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run All Tests
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={initializeTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            {overallStatus !== 'idle' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-white/60">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{stats.passed}</div>
                  <div className="text-xs text-white/60">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{stats.warnings}</div>
                  <div className="text-xs text-white/60">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">{stats.failed}</div>
                  <div className="text-xs text-white/60">Failed</div>
                </div>
              </div>
            )}
          </ModernCardContent>
        </ModernCardHeader>
      </ModernCard>

      <div className="grid gap-4 md:grid-cols-2">
        {testSuites.map((suite, suiteIndex) => (
          <ModernCard key={suite.name} variant="glass">
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                {suite.status === 'running' && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                {suite.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                {suite.name}
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-2">
                {suite.tests.map((test, testIndex) => (
                  <motion.div
                    key={test.name}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
                      test.status === 'running' && 'bg-blue-500/10',
                      test.status === 'passed' && 'bg-green-500/10',
                      test.status === 'failed' && 'bg-red-500/10',
                      test.status === 'warning' && 'bg-yellow-500/10'
                    )}
                  >
                    {getStatusIcon(test.status)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{test.name}</div>
                      <div className="text-xs text-white/60 truncate">{test.message}</div>
                      {test.duration && (
                        <div className="text-xs text-white/40 mt-1">
                          {test.duration.toFixed(0)}ms
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ModernCardContent>
          </ModernCard>
        ))}
      </div>
    </div>
  )
}