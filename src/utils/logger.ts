interface LogContext {
  userId?: string
  sessionId?: string
  transactionId?: string
  component?: string
  action?: string
  error?: string
  status?: string
  metric?: string
  metrics?: any
  scope?: string
  permission?: string
  title?: string
  value?: number
  score?: number
  threshold?: number
  thresholds?: any
  unit?: string
  metadata?: Record<string, any>
}

interface LogEntry extends LogContext {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: string
  correlationId: string
  environment: string
}

class Logger {
  private correlationId: string
  private sessionId: string
  private environment: string

  constructor() {
    this.correlationId = this.generateId()
    this.sessionId = this.getSessionId()
    this.environment = this.getEnvironment()
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = this.generateId()
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }

  private getEnvironment(): string {
    return window.location.hostname.includes('localhost') ? 'development' : 'production'
  }

  private createLogEntry(level: LogEntry['level'], message: string, context: LogContext = {}): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      correlationId: this.correlationId,
      sessionId: this.sessionId,
      environment: this.environment,
      ...context
    }
  }

  private async sendToBackend(entry: LogEntry) {
    if (this.environment === 'production') {
      try {
        // Send to logging service in production
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })
      } catch (error) {
        console.warn('Failed to send log to backend:', error)
      }
    }
  }

  debug(message: string, context?: LogContext) {
    const entry = this.createLogEntry('debug', message, context)
    console.debug('[DEBUG]', entry)
    this.sendToBackend(entry)
  }

  info(message: string, context?: LogContext) {
    const entry = this.createLogEntry('info', message, context)
    console.info('[INFO]', entry)
    this.sendToBackend(entry)
  }

  warn(message: string, context?: LogContext) {
    const entry = this.createLogEntry('warn', message, context)
    console.warn('[WARN]', entry)
    this.sendToBackend(entry)
  }

  error(message: string, context?: LogContext) {
    const entry = this.createLogEntry('error', message, context)
    console.error('[ERROR]', entry)
    this.sendToBackend(entry)
  }

  // Transaction-specific logging
  transaction = {
    start: (transactionId: string, metadata?: Record<string, any>) => {
      this.info('Transaction started', {
        transactionId,
        action: 'transaction_start',
        metadata
      })
    },
    
    success: (transactionId: string, metadata?: Record<string, any>) => {
      this.info('Transaction completed successfully', {
        transactionId,
        action: 'transaction_success',
        metadata
      })
    },
    
    error: (transactionId: string, error: string, metadata?: Record<string, any>) => {
      this.error('Transaction failed', {
        transactionId,
        action: 'transaction_error',
        metadata: { ...metadata, error }
      })
    }
  }

  // User action logging
  userAction(action: string, component: string, metadata?: Record<string, any>) {
    this.info(`User action: ${action}`, {
      action,
      component,
      metadata
    })
  }

  // Performance logging
  performance(metric: string, value: number, context?: LogContext) {
    this.info(`Performance metric: ${metric}`, {
      ...context,
      action: 'performance_metric',
      metadata: { metric, value, unit: 'ms' }
    })
  }

  // Set user context for all subsequent logs
  setUserContext(userId: string) {
    this.correlationId = `${userId}-${this.generateId()}`
  }
}

export const logger = new Logger()