import { safeGetItem, safeSetItem } from './storage-utils';

interface CacheOptions {
  /** Maximum age of cache in milliseconds before considered stale (default: 1 hour) */
  maxAge?: number;
  /** Key prefix for the cached data */
  keyPrefix?: string;
  /** Maximum items to keep in cache (default: 100) */
  maxItems?: number;
  /** Whether to compress data before storing (default: true for large data) */
  compress?: boolean;
}

const DEFAULT_OPTIONS: CacheOptions = {
  maxAge: 60 * 60 * 1000, // 1 hour
  keyPrefix: 'txcache_',
  maxItems: 100,
  compress: true
};

/**
 * Utility for efficient transaction caching
 * Supports offline-first approach with automatic data expiration
 */
export const transactionCache = {
  /**
   * Store transactions in cache with timestamp
   */
  storeTransactions: (
    key: string, 
    transactions: any[], 
    options: CacheOptions = {}
  ): boolean => {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      
      // Create cache object with metadata
      const cacheData = {
        timestamp: Date.now(),
        data: transactions,
        version: '1.0'
      };
      
      // Store in localStorage with safe method
      safeSetItem(`${opts.keyPrefix}${key}`, cacheData);
      
      // Update cache index for management
      const cacheIndex = safeGetItem<string[]>(`${opts.keyPrefix}index`, []);
      if (!cacheIndex.includes(key)) {
        cacheIndex.push(key);
        // Enforce max items limit by removing oldest items
        if (cacheIndex.length > (opts.maxItems || DEFAULT_OPTIONS.maxItems!)) {
          const keysToRemove = cacheIndex.slice(0, cacheIndex.length - (opts.maxItems || DEFAULT_OPTIONS.maxItems!));
          keysToRemove.forEach(oldKey => {
            localStorage.removeItem(`${opts.keyPrefix}${oldKey}`);
          });
          const newIndex = cacheIndex.slice(cacheIndex.length - (opts.maxItems || DEFAULT_OPTIONS.maxItems!));
          safeSetItem(`${opts.keyPrefix}index`, newIndex);
        } else {
          safeSetItem(`${opts.keyPrefix}index`, cacheIndex);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to cache transactions:', error);
      return false;
    }
  },
  
  /**
   * Retrieve transactions from cache if not expired
   */
  getTransactions: <T>(
    key: string, 
    options: CacheOptions = {}
  ): { data: T[] | null, isFresh: boolean, timestamp: number | null } => {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const cachedData = safeGetItem<{ timestamp: number, data: T[], version: string } | null>(
        `${opts.keyPrefix}${key}`, 
        null
      );
      
      if (!cachedData) {
        return { data: null, isFresh: false, timestamp: null };
      }
      
      const now = Date.now();
      const isFresh = now - cachedData.timestamp < (opts.maxAge || DEFAULT_OPTIONS.maxAge!);
      
      return { 
        data: cachedData.data, 
        isFresh, 
        timestamp: cachedData.timestamp
      };
    } catch (error) {
      console.error('Failed to retrieve cached transactions:', error);
      return { data: null, isFresh: false, timestamp: null };
    }
  },
  
  /**
   * Clear specific transaction cache
   */
  clearCache: (key: string, options: CacheOptions = {}): boolean => {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      localStorage.removeItem(`${opts.keyPrefix}${key}`);
      
      // Update index
      const cacheIndex = safeGetItem<string[]>(`${opts.keyPrefix}index`, []);
      const newIndex = cacheIndex.filter(k => k !== key);
      safeSetItem(`${opts.keyPrefix}index`, newIndex);
      
      return true;
    } catch (error) {
      console.error('Failed to clear transaction cache:', error);
      return false;
    }
  },
  
  /**
   * Clear all transaction caches
   */
  clearAllCaches: (options: CacheOptions = {}): boolean => {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const cacheIndex = safeGetItem<string[]>(`${opts.keyPrefix}index`, []);
      
      // Remove all cached items
      cacheIndex.forEach(key => {
        localStorage.removeItem(`${opts.keyPrefix}${key}`);
      });
      
      // Clear the index itself
      localStorage.removeItem(`${opts.keyPrefix}index`);
      
      return true;
    } catch (error) {
      console.error('Failed to clear all transaction caches:', error);
      return false;
    }
  },
  
  /**
   * Get cache statistics
   */
  getCacheStats: (options: CacheOptions = {}) => {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const cacheIndex = safeGetItem<string[]>(`${opts.keyPrefix}index`, []);
      
      let totalSize = 0;
      let oldestTimestamp = Date.now();
      let newestTimestamp = 0;
      
      cacheIndex.forEach(key => {
        const item = localStorage.getItem(`${opts.keyPrefix}${key}`);
        if (item) {
          totalSize += item.length;
          
          try {
            const parsed = JSON.parse(item);
            if (parsed.timestamp) {
              oldestTimestamp = Math.min(oldestTimestamp, parsed.timestamp);
              newestTimestamp = Math.max(newestTimestamp, parsed.timestamp);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      });
      
      return {
        count: cacheIndex.length,
        totalSizeBytes: totalSize,
        oldestTimestamp: oldestTimestamp !== Date.now() ? oldestTimestamp : null,
        newestTimestamp: newestTimestamp !== 0 ? newestTimestamp : null,
        approximateSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        count: 0,
        totalSizeBytes: 0,
        oldestTimestamp: null,
        newestTimestamp: null,
        approximateSizeMB: '0'
      };
    }
  }
};
