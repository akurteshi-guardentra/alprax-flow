import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000
};

/**
 * Hook for payment retry logic with exponential backoff
 */
export function usePaymentRetry<T>(config: Partial<RetryConfig> = {}) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  const executeWithRetry = useCallback(async (
    operation: () => Promise<T>,
    onError?: (error: Error, attempt: number) => void
  ): Promise<T> => {
    // Cancel any existing retry operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsRetrying(true);
    setAttemptCount(0);

    let lastError: Error;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      if (signal.aborted) {
        throw new Error('Operation cancelled');
      }

      setAttemptCount(attempt);

      try {
        const result = await operation();
        setIsRetrying(false);
        setAttemptCount(0);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        console.warn(`Payment attempt ${attempt} failed:`, lastError.message);
        
        if (onError) {
          onError(lastError, attempt);
        }

        // Don't retry on the last attempt
        if (attempt === retryConfig.maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        );

        // Add some jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;

        toast.info(`Payment failed. Retrying in ${Math.ceil(jitteredDelay / 1000)} seconds... (${attempt}/${retryConfig.maxAttempts})`);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      }
    }

    setIsRetrying(false);
    setAttemptCount(0);
    
    toast.error(`Payment failed after ${retryConfig.maxAttempts} attempts`);
    throw lastError;
  }, [retryConfig]);

  const cancelRetry = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsRetrying(false);
      setAttemptCount(0);
      toast.info('Payment retry cancelled');
    }
  }, []);

  return {
    executeWithRetry,
    cancelRetry,
    isRetrying,
    attemptCount,
    maxAttempts: retryConfig.maxAttempts
  };
}