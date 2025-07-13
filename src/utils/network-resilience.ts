/**
 * Network resilience utilities for production
 */

export class NetworkResilience {
  private static retryDelays = [1000, 2000, 4000, 8000]; // Exponential backoff
  private static isOnline = navigator.onLine;

  static initialize(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network connection restored');
      this.handleReconnection();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network connection lost');
    });
  }

  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (!this.isOnline && attempt > 0) {
          throw new Error('Network offline');
        }

        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retry
        const delay = this.retryDelays[attempt] || 8000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  static isNetworkError(error: any): boolean {
    if (!error) return false;

    const networkErrorMessages = [
      'fetch',
      'network',
      'timeout',
      'connection',
      'offline'
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    return networkErrorMessages.some(msg => errorMessage.includes(msg));
  }

  private static handleReconnection(): void {
    // Retry failed requests
    const event = new CustomEvent('network-reconnected');
    window.dispatchEvent(event);
  }

  static getConnectionInfo(): any {
    if ('connection' in navigator) {
      return (navigator as any).connection;
    }
    return null;
  }

  static isSlowConnection(): boolean {
    const connection = this.getConnectionInfo();
    if (!connection) return false;

    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g';
  }
}