import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'
import { Activity, Database, Shield, Server, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor'

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  services: {
    database: { status: string; latency?: number; error?: string }
    auth: { status: string; latency?: number; error?: string }
    storage: { status: string; latency?: number; error?: string }
  }
  version: string
  uptime: number
}

interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalTransactions: number
  successRate: number
  averageResponseTime: number
  errorRate: number
}

export function SystemHealthDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const { metrics, performanceScore } = usePerformanceMonitor('SystemHealthDashboard')

  const fetchHealthStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('health-check')
      
      if (error) {
        logger.error('Failed to fetch health status', { error: error.message })
        return
      }
      
      setHealthStatus(data)
      logger.info('Health status updated', { status: data.status })
    } catch (error) {
      logger.error('Health check request failed', { error: error.message })
    }
  }

  const fetchSystemMetrics = async () => {
    try {
      // Fetch user metrics
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch active users (last 24 hours)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const { count: activeUsers } = await supabase
        .from('stellar_transactions')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString())

      // Fetch transaction metrics
      const { count: totalTransactions } = await supabase
        .from('stellar_transactions')
        .select('*', { count: 'exact', head: true })

      const { count: successfulTransactions } = await supabase
        .from('stellar_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      const successRate = totalTransactions ? (successfulTransactions / totalTransactions) * 100 : 0

      // Calculate average response time from recent transactions
      const { data: recentTransactions } = await supabase
        .from('stellar_transactions')
        .select('created_at, completed_at')
        .not('completed_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100)

      let averageResponseTime = 0
      if (recentTransactions && recentTransactions.length > 0) {
        const totalTime = recentTransactions.reduce((sum, tx) => {
          const start = new Date(tx.created_at).getTime()
          const end = new Date(tx.completed_at).getTime()
          return sum + (end - start)
        }, 0)
        averageResponseTime = totalTime / recentTransactions.length / 1000 // Convert to seconds
      }

      // Calculate error rate
      const { count: failedTransactions } = await supabase
        .from('stellar_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gte('created_at', yesterday.toISOString())

      const errorRate = totalTransactions ? (failedTransactions / totalTransactions) * 100 : 0

      setSystemMetrics({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalTransactions: totalTransactions || 0,
        successRate,
        averageResponseTime,
        errorRate
      })

    } catch (error) {
      logger.error('Failed to fetch system metrics', { error: error.message })
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    await Promise.all([fetchHealthStatus(), fetchSystemMetrics()])
    setLastRefresh(new Date())
    setIsLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'unhealthy':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === 'healthy' ? 'default' : 
                   status === 'degraded' ? 'secondary' : 'destructive'
    return (
      <Badge variant={variant} className="capitalize">
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    )
  }

  if (isLoading && !healthStatus) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <EnhancedSkeleton variant="button" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EnhancedSkeleton variant="card" count={4} />
        </div>
        <EnhancedSkeleton variant="card" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Health Dashboard</h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button 
            onClick={refreshData} 
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health Status */}
      {healthStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Overall System Health</span>
              {getStatusBadge(healthStatus.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4" />
                  <span className="font-medium">Database</span>
                  {getStatusBadge(healthStatus.services.database.status)}
                </div>
                {healthStatus.services.database.latency && (
                  <p className="text-sm text-muted-foreground">
                    Latency: {healthStatus.services.database.latency}ms
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Authentication</span>
                  {getStatusBadge(healthStatus.services.auth.status)}
                </div>
                {healthStatus.services.auth.latency && (
                  <p className="text-sm text-muted-foreground">
                    Latency: {healthStatus.services.auth.latency}ms
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4" />
                  <span className="font-medium">Storage</span>
                  {getStatusBadge(healthStatus.services.storage.status)}
                </div>
                {healthStatus.services.storage.latency && (
                  <p className="text-sm text-muted-foreground">
                    Latency: {healthStatus.services.storage.latency}ms
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Metrics */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{systemMetrics.totalUsers}</div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <div className="text-lg">{systemMetrics.activeUsers}</div>
                <p className="text-sm text-muted-foreground">Active (24h)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{systemMetrics.totalTransactions}</div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <div className="text-lg text-green-600">{systemMetrics.successRate.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{systemMetrics.averageResponseTime.toFixed(1)}s</div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <div className="text-lg text-red-600">{systemMetrics.errorRate.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">Error Rate (24h)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle>Application Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-bold text-blue-600">{performanceScore}</div>
              <p className="text-sm text-muted-foreground">Performance Score</p>
            </div>
            {metrics.renderTime && (
              <div>
                <div className="text-xl font-semibold">{metrics.renderTime}ms</div>
                <p className="text-sm text-muted-foreground">Component Render Time</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}