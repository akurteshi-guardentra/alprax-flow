import { captureError } from './error-tracking';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up old entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  checkLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get existing requests for this identifier
    let userRequests = this.requests.get(identifier) || [];
    
    // Remove requests outside the current window
    userRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    // Update the requests array
    this.requests.set(identifier, userRequests);
    
    const currentCount = userRequests.length;
    const remaining = Math.max(0, this.config.maxRequests - currentCount);
    const resetTime = Math.max(...userRequests, windowStart) + this.config.windowMs;
    
    if (currentCount >= this.config.maxRequests) {
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      
      captureError(new Error('Rate limit exceeded'), {
        component: 'RateLimiter',
        action: 'checkLimit',
        metadata: {
          identifier,
          currentCount,
          maxRequests: this.config.maxRequests,
          retryAfter
        }
      }, 'medium');
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter
      };
    }
    
    // Add current request
    userRequests.push(now);
    this.requests.set(identifier, userRequests);
    
    return {
      allowed: true,
      remaining: remaining - 1,
      resetTime
    };
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        timestamp => timestamp > now - this.config.windowMs
      );
      
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  getStats(): { totalUsers: number; totalRequests: number } {
    let totalRequests = 0;
    
    for (const requests of this.requests.values()) {
      totalRequests += requests.length;
    }
    
    return {
      totalUsers: this.requests.size,
      totalRequests
    };
  }
}

// Global rate limiters for different use cases
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes for auth attempts
});

export const transactionRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute for transactions
});

// Middleware-like function for rate limiting
export function withRateLimit<T extends any[], R>(
  rateLimiter: RateLimiter,
  getIdentifier: (...args: T) => string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const identifier = getIdentifier(...args);
    const limitResult = rateLimiter.checkLimit(identifier);
    
    if (!limitResult.allowed) {
      throw new Error(`Rate limit exceeded. Retry after ${limitResult.retryAfter} seconds.`);
    }
    
    return fn(...args);
  };
}