/**
 * Network resilience utilities to enhance existing API operations
 * These utilities help existing network requests be more robust on mobile
 * without changing their core functionality
 */

/**
 * Adds exponential backoff retry logic to any async function
 * @param asyncFn The async function to retry (typically an API call)
 * @param maxRetries Maximum number of retries before failing
 * @param baseDelayMs Base delay time in ms (will be multiplied by 2^retryAttempt)
 * @param shouldRetry Optional function to determine if retry should happen based on error
 */
export const withRetry = async <T>(
  asyncFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 300,
  shouldRetry: (error: any) => boolean = () => true
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry based on error
      if (attempt >= maxRetries || !shouldRetry(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff and small random factor
      const delay = baseDelayMs * Math.pow(2, attempt) * (0.9 + Math.random() * 0.2);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError;
};

/**
 * Adds timeout to any async function to prevent hanging requests
 * @param asyncFn The async function to add timeout to
 * @param timeoutMs Timeout duration in ms
 */
export const withTimeout = async <T>(
  asyncFn: () => Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    
    asyncFn()
      .then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

/**
 * Adds offline caching behavior to API calls
 * @param asyncFn The async function to add caching to
 * @param cacheKey Key to identify the cached data
 * @param cacheTime Duration in ms to consider cache valid
 */
export const withOfflineCache = async <T>(
  asyncFn: () => Promise<T>,
  cacheKey: string,
  cacheTime: number = 3600000 // 1 hour default
): Promise<T> => {
  try {
    // Try to execute the function normally
    const result = await asyncFn();
    
    // Cache the successful result
    try {
      const cacheData = {
        timestamp: Date.now(),
        data: result
      };
      localStorage.setItem(`offline_cache_${cacheKey}`, JSON.stringify(cacheData));
    } catch (cacheError) {
      // Silently fail caching (storage might be full or disabled)
      console.warn('Failed to cache result:', cacheError);
    }
    
    return result;
  } catch (error) {
    // On failure, try to use cached data
    try {
      const cachedJson = localStorage.getItem(`offline_cache_${cacheKey}`);
      
      if (cachedJson) {
        const cached = JSON.parse(cachedJson);
        const isValid = Date.now() - cached.timestamp < cacheTime;
        
        if (isValid) {
          // Return cached data with a flag to indicate it's from cache
          return {
            ...cached.data,
            _fromCache: true
          };
        }
      }
    } catch (cacheError) {
      // Silently fail cache retrieval
    }
    
    // Re-throw the original error if we couldn't use cache
    throw error;
  }
};

/**
 * Combine multiple resilience methods for complete protection
 */
export const withResilience = <T>(
  asyncFn: () => Promise<T>,
  options = {
    cacheKey: '',
    cacheTime: 3600000,
    maxRetries: 2,
    timeoutMs: 10000
  }
): (() => Promise<T>) => {
  return () => withRetry(
    () => withTimeout(
      () => withOfflineCache(asyncFn, options.cacheKey, options.cacheTime),
      options.timeoutMs
    ),
    options.maxRetries
  );
};
