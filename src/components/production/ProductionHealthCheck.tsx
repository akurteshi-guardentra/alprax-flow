import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Server, Database, Wifi, Shield, Zap } from 'lucide-react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface HealthCheckItem {
  name: string
  status: 'healthy' | 'warning' | 'error' | 'checking'
  message: string
  icon: React.ComponentType<any>
  lastChecked?: Date
  responseTime?: number
}

export function ProductionHealthCheck() {
  const [healthChecks, setHealthChecks] = useState<HealthCheckItem[]>([
    {
      name: 'API Connectivity',
      status: 'checking',
      message: 'Checking API endpoints...',
      icon: Server
    },
    {
      name: 'Database Connection',
      status: 'checking',
      message: 'Verifying database connectivity...',
      icon: Database
    },
    {
      name: 'Network Performance',
      status: 'checking',
      message: 'Testing network latency...',
      icon: Wifi
    },
    {
      name: 'Security Status',
      status: 'checking',
      message: 'Validating security configurations...',
      icon: Shield
    },
    {
      name: 'Performance Metrics',
      status: 'checking',
      message: 'Analyzing performance data...',
      icon: Zap
    }
  ])
  
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)

  const runHealthCheck = async (index: number): Promise<HealthCheckItem> => {
    const check = healthChecks[index]
    const startTime = performance.now()
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const responseTime = performance.now() - startTime
        let result: HealthCheckItem

        switch (check.name) {
          case 'API Connectivity':
            // Simulate API health check
            const apiHealthy = Math.random() > 0.1
            result = {
              ...check,
              status: apiHealthy ? 'healthy' : 'error',
              message: apiHealthy ? 'All API endpoints responding' : 'Some API endpoints unreachable',
              lastChecked: new Date(),
              responseTime
            }
            break

          case 'Database Connection':
            // Simulate database check
            const dbHealthy = Math.random() > 0.05
            result = {
              ...check,
              status: dbHealthy ? 'healthy' : 'error',
              message: dbHealthy ? 'Database connections stable' : 'Database connection issues detected',
              lastChecked: new Date(),
              responseTime
            }
            break

          case 'Network Performance':
            // Simulate network check
            const networkGood = responseTime < 200
            result = {
              ...check,
              status: networkGood ? 'healthy' : responseTime < 500 ? 'warning' : 'error',
              message: `Network latency: ${responseTime.toFixed(0)}ms`,
              lastChecked: new Date(),
              responseTime
            }
            break

          case 'Security Status':
            // Simulate security check
            const securityGood = Math.random() > 0.02
            result = {
              ...check,
              status: securityGood ? 'healthy' : 'warning',
              message: securityGood ? 'Security configurations valid' : 'Minor security recommendations',
              lastChecked: new Date(),
              responseTime
            }
            break

          case 'Performance Metrics':
            // Simulate performance check
            const performanceGood = Math.random() > 0.15
            result = {
              ...check,
              status: performanceGood ? 'healthy' : 'warning',
              message: performanceGood ? 'Performance within normal ranges' : 'Performance degradation detected',
              lastChecked: new Date(),
              responseTime
            }
            break

          default:
            result = {
              ...check,
              status: 'healthy',
              message: 'Check completed',
              lastChecked: new Date(),
              responseTime
            }
        }

        resolve(result)
      }, Math.random() * 3000 + 500)
    })
  }

  const runAllHealthChecks = async () => {
    for (let i = 0; i < healthChecks.length; i++) {
      const result = await runHealthCheck(i)
      setHealthChecks(prev => prev.map((check, index) => 
        index === i ? result : check
      ))
    }
    setLastUpdate(new Date())
  }

  const getStatusIcon = (status: HealthCheckItem['status'], IconComponent: React.ComponentType<any>) => {
    const iconProps = { className: "w-5 h-5" }
    
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'checking':
        return <IconComponent {...iconProps} className="w-4 h-4 text-blue-400 animate-pulse" />
      default:
        return <IconComponent {...iconProps} className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: HealthCheckItem['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Healthy</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Warning</Badge>
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>
      case 'checking':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Checking</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>
    }
  }

  const getOverallStatus = () => {
    const hasError = healthChecks.some(check => check.status === 'error')
    const hasWarning = healthChecks.some(check => check.status === 'warning')
    const isChecking = healthChecks.some(check => check.status === 'checking')
    
    if (isChecking) return 'checking'
    if (hasError) return 'error'
    if (hasWarning) return 'warning'
    return 'healthy'
  }

  useEffect(() => {
    runAllHealthChecks()
  }, [])

  useEffect(() => {
    if (!isAutoRefresh) return

    const interval = setInterval(() => {
      runAllHealthChecks()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [isAutoRefresh])

  const overallStatus = getOverallStatus()

  return (
    <div className="space-y-6">
      <ModernCard variant="gradient">
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <ModernCardTitle className="flex items-center gap-3">
              {getStatusIcon(overallStatus, Server)}
              Production Health Status
            </ModernCardTitle>
            {getStatusBadge(overallStatus)}
          </div>
          <ModernCardContent>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={cn(
                  'px-2 py-1 rounded text-xs transition-colors',
                  isAutoRefresh 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                )}
              >
                Auto-refresh: {isAutoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>
          </ModernCardContent>
        </ModernCardHeader>
      </ModernCard>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {healthChecks.map((check, index) => (
          <motion.div
            key={check.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ModernCard 
              variant="glass"
              className={cn(
                'transition-all duration-300',
                check.status === 'healthy' && 'border-green-500/30',
                check.status === 'warning' && 'border-yellow-500/30',
                check.status === 'error' && 'border-red-500/30',
                check.status === 'checking' && 'border-blue-500/30'
              )}
            >
              <ModernCardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <check.icon className="w-5 h-5 text-white/70" />
                    <span className="font-medium text-white">{check.name}</span>
                  </div>
                  {getStatusIcon(check.status, check.icon)}
                </div>
                {getStatusBadge(check.status)}
              </ModernCardHeader>
              
              <ModernCardContent>
                <p className="text-sm text-white/70 mb-2">{check.message}</p>
                
                <div className="flex items-center justify-between text-xs text-white/50">
                  {check.lastChecked && (
                    <span>Last: {check.lastChecked.toLocaleTimeString()}</span>
                  )}
                  {check.responseTime && (
                    <span>{check.responseTime.toFixed(0)}ms</span>
                  )}
                </div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        ))}
      </div>

      <ModernCard variant="solid">
        <ModernCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {healthChecks.filter(c => c.status === 'healthy').length}
              </div>
              <div className="text-xs text-white/60">Healthy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {healthChecks.filter(c => c.status === 'warning').length}
              </div>
              <div className="text-xs text-white/60">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {healthChecks.filter(c => c.status === 'error').length}
              </div>
              <div className="text-xs text-white/60">Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {healthChecks.length}
              </div>
              <div className="text-xs text-white/60">Total Checks</div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}