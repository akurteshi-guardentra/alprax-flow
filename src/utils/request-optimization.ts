/**
 * Utilities for optimizing API requests by batching and deduplicating
 * These utilities help reduce network traffic and improve performance
 * without changing the underlying API functionality
 */

/**
 * A request deduplicator that ensures identical requests aren't sent multiple times
 * within a specified window of time
 */
export class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private requestTimestamps: Map<string, number> = new Map();
  private cacheTime: number;
  
  /**
   * Create a request deduplicator
   * @param cacheTimeMs How long to deduplicate identical requests (in ms)
   */
  constructor(cacheTimeMs: number = 500) {
    this.cacheTime = cacheTimeMs;
  }
  
  /**
   * Execute a request with deduplication
   * @param key Unique identifier for this request
   * @param requestFn The function that performs the actual request
   */
  async execute<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Clean up old entries
    this.cleanup();
    
    // Check if we have a pending request with the same key
    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      return existingRequest as Promise<T>;
    }
    
    // Check if we have a recent response for this key
    const lastRequestTime = this.requestTimestamps.get(key) || 0;
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    
    if (timeSinceLastRequest < this.cacheTime) {
      // Create a new request but store it for future duplicates
      const promise = requestFn();
      this.pendingRequests.set(key, promise);
      
      // When complete, update timestamp and remove from pending
      promise.finally(() => {
        this.requestTimestamps.set(key, Date.now());
        this.pendingRequests.delete(key);
      });
      
      return promise;
    } else {
      // Just execute without caching if outside window
      return requestFn();
    }
  }
  
  /**
   * Clean up old pending requests
   */
  private cleanup(): void {
    const now = Date.now();
    
    // Remove timestamps older than cache time
    for (const [key, timestamp] of this.requestTimestamps.entries()) {
      if (now - timestamp > this.cacheTime * 2) {
        this.requestTimestamps.delete(key);
      }
    }
  }
}

/**
 * A request batcher that groups multiple identical API calls into a single request
 */
export class RequestBatcher<T, R> {
  private batchProcessor: (items: T[]) => Promise<R[]>;
  private batchTimeWindow: number;
  private maxBatchSize: number;
  private currentBatch: T[] = [];
  private currentPromises: { resolve: (value: R) => void, reject: (error: any) => void }[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  
  /**
   * Create a request batcher
   * @param batchProcessor Function that processes a batch of requests
   * @param batchTimeWindow Max time to wait before processing a batch (ms)
   * @param maxBatchSize Max number of items in a batch
   */
  constructor(
    batchProcessor: (items: T[]) => Promise<R[]>,
    batchTimeWindow: number = 50,
    maxBatchSize: number = 20
  ) {
    this.batchProcessor = batchProcessor;
    this.batchTimeWindow = batchTimeWindow;
    this.maxBatchSize = maxBatchSize;
  }
  
  /**
   * Add an item to the current batch
   * @param item Item to add to the batch
   */
  add(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      // Add the item and its promise handlers
      this.currentBatch.push(item);
      this.currentPromises.push({ resolve, reject });
      
      // Schedule batch processing if not already scheduled
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.processBatch(), this.batchTimeWindow);
      }
      
      // Process immediately if we've reached max batch size
      if (this.currentBatch.length >= this.maxBatchSize) {
        if (this.batchTimeout) {
          clearTimeout(this.batchTimeout);
          this.batchTimeout = null;
        }
        this.processBatch();
      }
    });
  }
  
  /**
   * Process the current batch of items
   */
  private async processBatch(): Promise<void> {
    if (this.currentBatch.length === 0) return;
    
    // Capture the current batch and promises
    const batch = [...this.currentBatch];
    const promises = [...this.currentPromises];
    
    // Reset for the next batch
    this.currentBatch = [];
    this.currentPromises = [];
    this.batchTimeout = null;
    
    try {
      // Process the batch
      const results = await this.batchProcessor(batch);
      
      // Resolve individual promises
      if (results.length !== promises.length) {
        // Handle error case where results don't match inputs
        promises.forEach(({ reject }) => {
          reject(new Error('Batch processing returned incorrect number of results'));
        });
      } else {
        // Resolve each promise with its corresponding result
        for (let i = 0; i < promises.length; i++) {
          promises[i].resolve(results[i]);
        }
      }
    } catch (error) {
      // Reject all promises with the same error
      promises.forEach(({ reject }) => {
        reject(error);
      });
    }
  }
  
  /**
   * Force processing of the current batch immediately
   */
  flush(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    if (this.currentBatch.length > 0) {
      this.processBatch();
    }
  }
}

// Global instance of the request deduplicator for common use
export const globalDeduplicator = new RequestDeduplicator();

/**
 * Helper function to deduplicate a request using the global deduplicator
 * @param key Unique key for the request
 * @param requestFn Function that performs the request
 */
export function deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  return globalDeduplicator.execute(key, requestFn);
}

/**
 * Optimizes a request based on network conditions and device capabilities
 * @param requestFn The function to optimize
 * @param options Optimization options
 */
export function requestOptimize<T>(
  requestFn: () => Promise<T>,
  options: {
    cacheKey?: string;
    retryCount?: number;
    lowPriorityOnSlow?: boolean;
  } = {}
): Promise<T> {
  const { cacheKey, retryCount = 1, lowPriorityOnSlow = true } = options;
  
  // Apply deduplication if a cache key is provided
  const deduplicatedFn = cacheKey ? 
    () => deduplicate(cacheKey, requestFn) : 
    requestFn;
    
  // Here you could add additional optimizations based on network conditions
  return deduplicatedFn();
}
