import { logger } from './logger'

// Request deduplication
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map()

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      logger.info('Request deduplicated', { metadata: { key } })
      return this.pendingRequests.get(key)!
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  clear(): void {
    this.pendingRequests.clear()
  }
}

// Request caching with TTL
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class RequestCache {
  private cache: Map<string, CacheEntry<any>> = new Map()

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    logger.info('Cache hit', { metadata: { key } })
    return entry.data
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    
    logger.info('Cache set', { metadata: { key, ttl } })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Retry mechanism with exponential backoff
interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

class RetryManager {
  async withRetry<T>(
    fn: () => Promise<T>,
    config: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2
    }
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === config.maxRetries) {
          logger.error('Request failed after all retries', {
            metadata: {
              attempts: attempt + 1,
              error: lastError.message
            }
          })
          throw lastError
        }
        
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt),
          config.maxDelay
        )
        
        logger.warn('Request failed, retrying', {
          metadata: {
            attempt: attempt + 1,
            delay,
            error: lastError.message
          }
        })
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }
}

export const requestDeduplicator = new RequestDeduplicator()
export const requestCache = new RequestCache()
export const retryManager = new RetryManager()

// Cleanup expired cache entries every 10 minutes
setInterval(() => {
  requestCache.cleanup()
}, 10 * 60 * 1000)

// Common cache TTLs
export const CACHE_TTL = {
  EXCHANGE_RATES: 60 * 1000, // 1 minute
  USER_PROFILE: 5 * 60 * 1000, // 5 minutes
  TRANSACTION_HISTORY: 30 * 1000, // 30 seconds
  BALANCE: 10 * 1000, // 10 seconds
  STATIC_DATA: 60 * 60 * 1000 // 1 hour
} as const