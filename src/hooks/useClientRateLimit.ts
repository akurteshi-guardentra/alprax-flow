import { useState, useCallback, useRef } from 'react';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  requestCount: number;
  windowStart: number;
  isBlocked: boolean;
  blockUntil?: number;
}

/**
 * Client-side rate limiting hook to prevent API spam
 */
export function useClientRateLimit(config: RateLimitConfig) {
  const [isLimited, setIsLimited] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const stateRef = useRef<RateLimitState>({
    requestCount: 0,
    windowStart: Date.now(),
    isBlocked: false
  });

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const state = stateRef.current;

    // Check if we're still blocked
    if (state.isBlocked && state.blockUntil && now < state.blockUntil) {
      const remaining = Math.ceil((state.blockUntil - now) / 1000);
      setTimeUntilReset(remaining);
      setIsLimited(true);
      return false;
    }

    // Reset if block period is over
    if (state.isBlocked && state.blockUntil && now >= state.blockUntil) {
      state.isBlocked = false;
      state.blockUntil = undefined;
      state.requestCount = 0;
      state.windowStart = now;
      setIsLimited(false);
      setTimeUntilReset(0);
    }

    // Reset window if expired
    if (now - state.windowStart >= config.windowMs) {
      state.requestCount = 0;
      state.windowStart = now;
    }

    // Check if we've exceeded the limit
    if (state.requestCount >= config.maxRequests) {
      state.isBlocked = true;
      state.blockUntil = now + (config.blockDurationMs || config.windowMs);
      const remaining = Math.ceil((state.blockUntil - now) / 1000);
      setTimeUntilReset(remaining);
      setIsLimited(true);
      return false;
    }

    // Allow request and increment counter
    state.requestCount++;
    return true;
  }, [config]);

  const executeWithRateLimit = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    if (!checkRateLimit()) {
      throw new Error(`Rate limit exceeded. Try again in ${timeUntilReset} seconds.`);
    }

    return operation();
  }, [checkRateLimit, timeUntilReset]);

  const reset = useCallback(() => {
    stateRef.current = {
      requestCount: 0,
      windowStart: Date.now(),
      isBlocked: false
    };
    setIsLimited(false);
    setTimeUntilReset(0);
  }, []);

  return {
    isLimited,
    timeUntilReset,
    executeWithRateLimit,
    reset,
    checkRateLimit
  };
}