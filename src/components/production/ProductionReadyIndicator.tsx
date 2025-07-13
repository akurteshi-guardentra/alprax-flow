import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'
import { deploymentHealthChecker, type DeploymentHealth } from '@/utils/deployment-health'

interface ProductionReadyIndicatorProps {
  showDetails?: boolean
  autoRefresh?: boolean
  className?: string
}

export function ProductionReadyIndicator({ 
  showDetails = false, 
  autoRefresh = true,
  className = '' 
}: ProductionReadyIndicatorProps) {
  const [health, setHealth] = useState<DeploymentHealth | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runHealthCheck = async () => {
    setIsLoading(true)
    try {
      const result = await deploymentHealthChecker.runHealthChecks()
      setHealth(result)
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runHealthCheck()

    if (autoRefresh) {
      const interval = setInterval(runHealthCheck, 5 * 60 * 1000) // Every 5 minutes
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!showDetails && health) {
    // Compact indicator
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon(health.overall)}
        <Badge variant={health.overall === 'healthy' ? 'default' : 'destructive'}>
          {health.overall.toUpperCase()}
        </Badge>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System Health</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={runHealthCheck}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {!health ? (
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Running health checks...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Overall Status */}
            <div className="flex items-center gap-2">
              {getStatusIcon(health.overall)}
              <span className="font-medium">
                Overall: {health.overall.charAt(0).toUpperCase() + health.overall.slice(1)}
              </span>
              <Badge variant="outline">{health.environment}</Badge>
            </div>

            {/* Individual Checks */}
            <div className="space-y-2">
              {health.checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.status)}
                    <span className="text-sm capitalize">{check.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {check.message}
                  </span>
                </div>
              ))}
            </div>

            {/* Metadata */}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              <div>Version: {health.version}</div>
              <div>Last check: {new Date(health.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}