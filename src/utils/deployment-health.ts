interface HealthCheck {
  name: string
  status: 'healthy' | 'warning' | 'error'
  message: string
  timestamp: number
  details?: any
}

interface DeploymentHealth {
  overall: 'healthy' | 'warning' | 'error'
  checks: HealthCheck[]
  timestamp: number
  environment: string
  version: string
}

class DeploymentHealthChecker {
  private checks: HealthCheck[] = []
  
  async runHealthChecks(): Promise<DeploymentHealth> {
    this.checks = []
    
    // Check critical services
    await this.checkSupabaseConnection()
    await this.checkLocalStorage()
    await this.checkPerformance()
    await this.checkSecurityHeaders()
    await this.checkServiceWorker()
    
    const overall = this.getOverallHealth()
    
    return {
      overall,
      checks: this.checks,
      timestamp: Date.now(),
      environment: this.getEnvironment(),
      version: this.getVersion()
    }
  }

  private async checkSupabaseConnection(): Promise<void> {
    try {
      const response = await fetch('https://vixpxmvsndusngxdmjuv.supabase.co/rest/v1/', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHB4bXZzbmR1c25neGRtanV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2ODI4NjYsImV4cCI6MjA1NDI1ODg2Nn0.P4isRrXOmEkgcSAoI4iQFxKm0eX6Bk0Lk7hBlTyXsyI'
        }
      })
      
      if (response.ok) {
        this.addCheck('supabase', 'healthy', 'Supabase connection successful')
      } else {
        this.addCheck('supabase', 'error', `Supabase connection failed: ${response.status}`)
      }
    } catch (error) {
      this.addCheck('supabase', 'error', `Supabase connection error: ${error}`)
    }
  }

  private async checkLocalStorage(): Promise<void> {
    try {
      const testKey = 'health_check_test'
      const testValue = Date.now().toString()
      
      localStorage.setItem(testKey, testValue)
      const retrieved = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)
      
      if (retrieved === testValue) {
        this.addCheck('localstorage', 'healthy', 'LocalStorage functioning correctly')
      } else {
        this.addCheck('localstorage', 'error', 'LocalStorage read/write test failed')
      }
    } catch (error) {
      this.addCheck('localstorage', 'error', `LocalStorage error: ${error}`)
    }
  }

  private async checkPerformance(): Promise<void> {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        
        if (loadTime < 3000) {
          this.addCheck('performance', 'healthy', `Page load time: ${loadTime.toFixed(0)}ms`)
        } else if (loadTime < 5000) {
          this.addCheck('performance', 'warning', `Page load time slow: ${loadTime.toFixed(0)}ms`)
        } else {
          this.addCheck('performance', 'error', `Page load time too slow: ${loadTime.toFixed(0)}ms`)
        }
      } else {
        this.addCheck('performance', 'warning', 'Navigation timing not available')
      }
    } catch (error) {
      this.addCheck('performance', 'error', `Performance check error: ${error}`)
    }
  }

  private async checkSecurityHeaders(): Promise<void> {
    try {
      const isHTTPS = location.protocol === 'https:'
      const hasSecureContext = window.isSecureContext
      
      if (isHTTPS && hasSecureContext) {
        this.addCheck('security', 'healthy', 'Running in secure context with HTTPS')
      } else if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        this.addCheck('security', 'warning', 'Development environment - security checks skipped')
      } else {
        this.addCheck('security', 'error', 'Not running in secure context - HTTPS required')
      }
    } catch (error) {
      this.addCheck('security', 'error', `Security check error: ${error}`)
    }
  }

  private async checkServiceWorker(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        
        if (registration) {
          this.addCheck('serviceworker', 'healthy', 'Service Worker registered')
        } else {
          this.addCheck('serviceworker', 'warning', 'Service Worker not registered')
        }
      } else {
        this.addCheck('serviceworker', 'warning', 'Service Worker not supported')
      }
    } catch (error) {
      this.addCheck('serviceworker', 'error', `Service Worker check error: ${error}`)
    }
  }

  private addCheck(name: string, status: HealthCheck['status'], message: string, details?: any): void {
    this.checks.push({
      name,
      status,
      message,
      timestamp: Date.now(),
      details
    })
  }

  private getOverallHealth(): 'healthy' | 'warning' | 'error' {
    const hasError = this.checks.some(check => check.status === 'error')
    const hasWarning = this.checks.some(check => check.status === 'warning')
    
    if (hasError) return 'error'
    if (hasWarning) return 'warning'
    return 'healthy'
  }

  private getEnvironment(): string {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      return 'development'
    }
    if (location.hostname.includes('staging') || location.hostname.includes('test')) {
      return 'staging'
    }
    return 'production'
  }

  private getVersion(): string {
    return document.querySelector('meta[name="version"]')?.getAttribute('content') || '1.0.0'
  }

  startContinuousMonitoring(intervalMs: number = 5 * 60 * 1000): () => void {
    const interval = setInterval(async () => {
      try {
        const health = await this.runHealthChecks()
        
        if (health.overall === 'error') {
          console.error('Health check failed:', health)
        } else if (health.overall === 'warning') {
          console.warn('Health check warnings:', health)
        }
        
        sessionStorage.setItem('app_health_status', JSON.stringify(health))
      } catch (error) {
        console.error('Health monitoring error:', error)
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }
}

export const deploymentHealthChecker = new DeploymentHealthChecker()
export type { DeploymentHealth, HealthCheck }