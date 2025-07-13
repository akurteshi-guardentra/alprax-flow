import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logger } from '@/utils/logger'

interface NetworkStatus {
  online: boolean
  downlink?: number
  effectiveType?: string
  rtt?: number
}

export function OfflineIndicator() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: navigator.onLine
  })
  const [showRetry, setShowRetry] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      
      setNetworkStatus({
        online: navigator.onLine,
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType,
        rtt: connection?.rtt
      })

      if (!navigator.onLine) {
        setShowRetry(true)
        logger.warn('Network connection lost', {
          component: 'OfflineIndicator',
          metadata: {
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          }
        })
      } else {
        setShowRetry(false)
        logger.info('Network connection restored', {
          component: 'OfflineIndicator',
          metadata: {
            downlink: connection?.downlink,
            effectiveType: connection?.effectiveType,
            rtt: connection?.rtt
          }
        })
      }
    }

    const handleOnline = () => updateNetworkStatus()
    const handleOffline = () => updateNetworkStatus()
    const handleConnectionChange = () => updateNetworkStatus()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for connection changes if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    
    try {
      // Test connectivity with a simple fetch
      const response = await fetch('/api/health-check', {
        method: 'GET',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        setShowRetry(false)
        logger.userAction('connectivity_retry_success', 'OfflineIndicator')
      } else {
        throw new Error('Health check failed')
      }
    } catch (error) {
      logger.error('Connectivity retry failed', {
        component: 'OfflineIndicator',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsRetrying(false)
    }
  }

  const getConnectionQuality = () => {
    if (!networkStatus.online) return 'offline'
    if (!networkStatus.effectiveType) return 'unknown'
    
    switch (networkStatus.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'poor'
      case '3g':
        return 'fair'
      case '4g':
        return 'good'
      default:
        return 'unknown'
    }
  }

  const getStatusColor = () => {
    const quality = getConnectionQuality()
    switch (quality) {
      case 'offline':
        return 'text-red-600 dark:text-red-400'
      case 'poor':
        return 'text-orange-600 dark:text-orange-400'
      case 'fair':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'good':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusText = () => {
    if (!networkStatus.online) return 'You are offline'
    
    const quality = getConnectionQuality()
    switch (quality) {
      case 'poor':
        return 'Slow connection detected'
      case 'fair':
        return 'Limited connectivity'
      case 'good':
        return 'Connected'
      default:
        return 'Connected'
    }
  }

  // Only show indicator when offline or connection is poor
  const shouldShow = !networkStatus.online || getConnectionQuality() === 'poor'

  if (!shouldShow) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <Card className="mx-auto max-w-md border-warning/20 bg-warning/5 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {networkStatus.online ? (
                  <Wifi className={`w-5 h-5 ${getStatusColor()}`} />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
                
                {!networkStatus.online && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Some features may not be available. Your data will sync when connection is restored.
                  </p>
                )}
                
                {networkStatus.online && networkStatus.effectiveType && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Connection: {networkStatus.effectiveType.toUpperCase()}
                    {networkStatus.downlink && ` • ${networkStatus.downlink} Mbps`}
                  </p>
                )}
              </div>
              
              {showRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="flex-shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}