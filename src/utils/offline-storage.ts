interface CacheEntry {
  data: any
  timestamp: number
  expiry?: number
}

interface QueueItem {
  id: string
  action: string
  data: any
  timestamp: number
  retries: number
}

class OfflineStorage {
  private readonly CACHE_PREFIX = 'alprax_cache_'
  private readonly QUEUE_KEY = 'alprax_offline_queue'
  private readonly MAX_RETRIES = 3
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24 hours

  // Cache management
  async setCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttl
      }
      
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(entry))
    } catch (error) {
      console.warn('Failed to set cache:', error)
    }
  }

  async getCache(key: string): Promise<any | null> {
    try {
      const item = localStorage.getItem(this.CACHE_PREFIX + key)
      if (!item) return null

      const entry: CacheEntry = JSON.parse(item)
      
      // Check if expired
      if (entry.expiry && Date.now() > entry.expiry) {
        this.removeCache(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn('Failed to get cache:', error)
      return null
    }
  }

  async removeCache(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key)
    } catch (error) {
      console.warn('Failed to remove cache:', error)
    }
  }

  async clearExpiredCache(): Promise<void> {
    try {
      const keys = Object.keys(localStorage)
      const now = Date.now()

      for (const key of keys) {
        if (key.startsWith(this.CACHE_PREFIX)) {
          const item = localStorage.getItem(key)
          if (item) {
            try {
              const entry: CacheEntry = JSON.parse(item)
              if (entry.expiry && now > entry.expiry) {
                localStorage.removeItem(key)
              }
            } catch {
              // Invalid entry, remove it
              localStorage.removeItem(key)
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clear expired cache:', error)
    }
  }

  // Offline queue management
  async addToQueue(action: string, data: any): Promise<string> {
    try {
      const queue = await this.getQueue()
      const item: QueueItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        data,
        timestamp: Date.now(),
        retries: 0
      }

      queue.push(item)
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue))
      
      return item.id
    } catch (error) {
      console.error('Failed to add to queue:', error)
      throw error
    }
  }

  async getQueue(): Promise<QueueItem[]> {
    try {
      const item = localStorage.getItem(this.QUEUE_KEY)
      return item ? JSON.parse(item) : []
    } catch (error) {
      console.warn('Failed to get queue:', error)
      return []
    }
  }

  async removeFromQueue(id: string): Promise<void> {
    try {
      const queue = await this.getQueue()
      const filtered = queue.filter(item => item.id !== id)
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.warn('Failed to remove from queue:', error)
    }
  }

  async incrementRetries(id: string): Promise<boolean> {
    try {
      const queue = await this.getQueue()
      const item = queue.find(item => item.id === id)
      
      if (!item) return false

      item.retries++
      
      if (item.retries >= this.MAX_RETRIES) {
        await this.removeFromQueue(id)
        return false
      }

      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue))
      return true
    } catch (error) {
      console.warn('Failed to increment retries:', error)
      return false
    }
  }

  async clearQueue(): Promise<void> {
    try {
      localStorage.removeItem(this.QUEUE_KEY)
    } catch (error) {
      console.warn('Failed to clear queue:', error)
    }
  }

  // Storage utilities
  async getStorageInfo(): Promise<{
    used: number
    available: number
    quota: number
  }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        return {
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          quota: estimate.quota || 0
        }
      }
    } catch (error) {
      console.warn('Storage API not available:', error)
    }

    // Fallback estimation
    let used = 0
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length
        }
      }
    } catch (error) {
      console.warn('Failed to estimate storage:', error)
    }

    return {
      used,
      available: 5 * 1024 * 1024 - used, // Assume 5MB limit
      quota: 5 * 1024 * 1024
    }
  }

  async cleanup(): Promise<void> {
    await this.clearExpiredCache()
    
    const storageInfo = await this.getStorageInfo()
    const usagePercent = storageInfo.used / storageInfo.quota
    
    // If using more than 80% of storage, clean up old cache entries
    if (usagePercent > 0.8) {
      try {
        const keys = Object.keys(localStorage)
        const cacheKeys = keys
          .filter(key => key.startsWith(this.CACHE_PREFIX))
          .map(key => {
            try {
              const entry: CacheEntry = JSON.parse(localStorage.getItem(key) || '{}')
              return { key, timestamp: entry.timestamp || 0 }
            } catch {
              return { key, timestamp: 0 }
            }
          })
          .sort((a, b) => a.timestamp - b.timestamp)

        // Remove oldest 25% of cache entries
        const toRemove = Math.ceil(cacheKeys.length * 0.25)
        for (let i = 0; i < toRemove; i++) {
          localStorage.removeItem(cacheKeys[i].key)
        }
      } catch (error) {
        console.warn('Failed to cleanup storage:', error)
      }
    }
  }
}

export const offlineStorage = new OfflineStorage()