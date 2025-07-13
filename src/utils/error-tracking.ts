// Production-ready error tracking and logging system
import { ENV } from '@/config/environment';

export interface ErrorContext {
  userId?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fingerprint: string;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: ErrorReport[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          component: 'global',
          action: 'unhandled_promise_rejection',
          metadata: { reason: event.reason }
        },
        'high'
      );
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(
        event.error || new Error(event.message),
        {
          component: 'global',
          action: 'javascript_error',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        },
        'high'
      );
    });

    // Handle React error boundary fallbacks
    this.setupReactErrorHandler();
  }

  private setupReactErrorHandler(): void {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Capture React errors
      if (args[0]?.includes?.('React') || args[0]?.includes?.('Warning')) {
        this.captureError(
          new Error(`React Error: ${args.join(' ')}`),
          {
            component: 'react',
            action: 'react_error',
            metadata: { args }
          },
          'medium'
        );
      }
      originalConsoleError.apply(console, args);
    };
  }

  public captureError(
    error: Error,
    context: Partial<ErrorContext> = {},
    severity: ErrorReport['severity'] = 'medium'
  ): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullContext: ErrorContext = {
      userId: this.getCurrentUserId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      ...context
    };

    const errorReport: ErrorReport = {
      id: errorId,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context: fullContext,
      severity,
      fingerprint: this.generateFingerprint(error, context)
    };

    this.errors.push(errorReport);
    
    // Store in localStorage for persistence
    this.persistError(errorReport);
    
    // Log to console in development
    if (ENV.isDevelopment) {
      console.error('Error captured:', errorReport);
    }

    // Send to monitoring service in production
    if (ENV.isProduction && ENV.FEATURES.ENABLE_ERROR_REPORTING) {
      this.sendToMonitoring(errorReport);
    }

    return errorId;
  }

  private generateFingerprint(error: Error, context: Partial<ErrorContext>): string {
    const key = `${error.name}_${error.message}_${context.component || 'unknown'}`;
    return btoa(key).substr(0, 16);
  }

  private getCurrentUserId(): string | undefined {
    // Get user ID from auth context or localStorage
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id;
      }
    } catch {
      // Ignore errors when getting user ID
    }
    return undefined;
  }

  private persistError(errorReport: ErrorReport): void {
    try {
      const existingErrors = this.getPersistedErrors();
      const updatedErrors = [...existingErrors, errorReport].slice(-50); // Keep last 50 errors
      localStorage.setItem('app_error_reports', JSON.stringify(updatedErrors));
    } catch (error) {
      console.warn('Failed to persist error report:', error);
    }
  }

  private getPersistedErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('app_error_reports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async sendToMonitoring(errorReport: ErrorReport): Promise<void> {
    try {
      // In a real application, this would send to Sentry, LogRocket, or similar
      console.log('Would send to monitoring service:', errorReport);
      
      // For now, we'll just store it locally
      // Future: implement actual error reporting service integration
    } catch (error) {
      console.warn('Failed to send error to monitoring service:', error);
    }
  }

  public getErrorReports(): ErrorReport[] {
    return [...this.errors];
  }

  public getPersistedErrorReports(): ErrorReport[] {
    return this.getPersistedErrors();
  }

  public clearErrors(): void {
    this.errors = [];
    localStorage.removeItem('app_error_reports');
  }

  // Manual error capturing with context
  public captureException(error: Error, extra: Record<string, any> = {}): string {
    return this.captureError(error, { metadata: extra }, 'medium');
  }

  // Capture user actions for debugging
  public captureUserAction(action: string, data: Record<string, any> = {}): void {
    if (ENV.isDevelopment) {
      console.log('User action:', action, data);
    }
    
    // Store user actions for debugging purposes
    try {
      const actions = JSON.parse(localStorage.getItem('user_actions') || '[]');
      actions.push({
        action,
        data,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId
      });
      
      // Keep last 100 actions
      const recentActions = actions.slice(-100);
      localStorage.setItem('user_actions', JSON.stringify(recentActions));
    } catch (error) {
      console.warn('Failed to capture user action:', error);
    }
  }
}

// Export singleton instance and class
export const errorTracker = ErrorTracker.getInstance();
export { ErrorTracker };

// Convenience functions
export const captureError = (error: Error, context?: Partial<ErrorContext>, severity?: ErrorReport['severity']) => 
  errorTracker.captureError(error, context, severity);

export const captureException = (error: Error, extra?: Record<string, any>) => 
  errorTracker.captureException(error, extra);

export const captureUserAction = (action: string, data?: Record<string, any>) => 
  errorTracker.captureUserAction(action, data);
