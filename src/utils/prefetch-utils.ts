/**
 * Network-aware resource prefetching utility
 * This helps optimize mobile performance by fetching resources when the network is good
 * and delaying or skipping prefetching when on poor connections
 */

interface PrefetchOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  lowPriority?: boolean;
  timeout?: number;
  skipIfSaveData?: boolean;
}

/**
 * Check if the current connection is considered 'good' enough to prefetch resources
 */
export function hasGoodConnection(): boolean {
  // Default to true if we can't determine
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return true;
  }

  // @ts-ignore - Navigator connection API is not in TypeScript defs yet
  const connection = navigator.connection;
  if (!connection) return true;

  // Check for save-data mode first (user explicitly wants to save data)
  // @ts-ignore
  if (connection.saveData) {
    return false;
  }

  // Check effective connection type
  // @ts-ignore
  const effectiveType = connection.effectiveType;
  
  // Consider 4g and better as good connections
  if (effectiveType === '4g') {
    return true;
  }

  // For other connection types, check additional metrics if available
  // @ts-ignore
  if (connection.downlink >= 1.5) {
    return true;
  }

  return false;
}

/**
 * Prefetch important resources (images, data) when the network is good
 */
export function prefetchResources(
  urls: string[], 
  options: PrefetchOptions = {}
): () => void {
  const {
    onSuccess,
    onError,
    lowPriority = true,
    timeout = 10000,
    skipIfSaveData = true,
  } = options;

  // First check if we're in save-data mode
  // @ts-ignore
  if (skipIfSaveData && navigator?.connection?.saveData) {
    console.log('Skipping prefetch, save-data is enabled');
    return () => {}; // Return empty abort function
  }

  // Check if we have a good enough connection for prefetching
  if (!hasGoodConnection() && !lowPriority) {
    console.log('Skipping prefetch, connection is not good enough');
    return () => {}; // Return empty abort function
  }

  const abortController = new AbortController();
  const { signal } = abortController;

  // Create a timeout to abort prefetching if it takes too long
  const timeoutId = setTimeout(() => {
    abortController.abort();
    console.warn('Prefetch timeout exceeded');
  }, timeout);

  // Process each URL
  Promise.all(
    urls.map(url => {
      // For images, use Image constructor
      if (url.match(/\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i)) {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;
        });
      }
      
      // For other resources, use fetch with appropriate options
      return fetch(url, { 
        signal,
        // Use low priority hint for non-critical resources
        priority: lowPriority ? 'low' : 'auto',
        // Don't follow redirects to minimize data usage
        redirect: 'error',
        // Only make HEAD request to check availability without downloading full resource
        method: 'HEAD',
      }).then(() => {});
    })
  )
    .then(() => {
      clearTimeout(timeoutId);
      if (onSuccess) onSuccess();
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Error prefetching resources:', error);
        if (onError) onError(error);
      }
    });

  // Return abort function
  return () => {
    clearTimeout(timeoutId);
    abortController.abort();
  };
}
