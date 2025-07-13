import { logger } from './logger'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  skipSuccessfulRequests?: boolean
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Get existing requests for this key
    let keyRequests = this.requests.get(key) || []
    
    // Filter out old requests
    keyRequests = keyRequests.filter(time => time > windowStart)
    
    // Check if limit exceeded
    if (keyRequests.length >= config.maxRequests) {
      logger.warn('Rate limit exceeded', {
        metadata: {
          key,
          requests: keyRequests.length,
          maxRequests: config.maxRequests
        }
      })
      return false
    }
    
    // Add current request
    keyRequests.push(now)
    this.requests.set(key, keyRequests)
    
    return true
  }

  cleanup(): void {
    const now = Date.now()
    const oldestAllowed = now - (24 * 60 * 60 * 1000) // 24 hours
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > oldestAllowed)
      
      if (validRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validRequests)
      }
    }
  }
}

export const rateLimiter = new RateLimiter()

// Cleanup old entries every hour
setInterval(() => {
  rateLimiter.cleanup()
}, 60 * 60 * 1000)

// Rate limit configurations
export const RATE_LIMITS = {
  PAYMENT: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 payments per minute
  TRANSACTION: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 transactions per minute
  KYC_UPLOAD: { maxRequests: 3, windowMs: 5 * 60 * 1000 }, // 3 uploads per 5 minutes
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 login attempts per 15 minutes
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 } // 100 general API calls per minute
} as const