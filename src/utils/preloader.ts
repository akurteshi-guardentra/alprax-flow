interface PreloadItem {
  type: 'image' | 'font' | 'script' | 'style' | 'data'
  url: string
  priority: 'critical' | 'high' | 'normal' | 'low'
  crossOrigin?: boolean
  timeout?: number
}

interface PreloadResult {
  url: string
  success: boolean
  loadTime: number
  error?: Error
}

class Preloader {
  private loadedResources = new Set<string>()
  private loadingPromises = new Map<string, Promise<PreloadResult>>()
  private abortControllers = new Map<string, AbortController>()

  // Preload a single resource
  async preload(item: PreloadItem): Promise<PreloadResult> {
    if (this.loadedResources.has(item.url)) {
      return {
        url: item.url,
        success: true,
        loadTime: 0
      }
    }

    if (this.loadingPromises.has(item.url)) {
      return this.loadingPromises.get(item.url)!
    }

    const startTime = performance.now()
    const abortController = new AbortController()
    this.abortControllers.set(item.url, abortController)

    const promise = this.loadResource(item, abortController.signal, startTime)
    this.loadingPromises.set(item.url, promise)

    try {
      const result = await promise
      this.loadedResources.add(item.url)
      return result
    } finally {
      this.loadingPromises.delete(item.url)
      this.abortControllers.delete(item.url)
    }
  }

  // Preload critical path resources
  async preloadCriticalPath(resources: { css: string[], js: string[], images: string[] }): Promise<void> {
    const items: PreloadItem[] = [
      ...resources.css.map(url => ({ type: 'style' as const, url, priority: 'critical' as const })),
      ...resources.js.map(url => ({ type: 'script' as const, url, priority: 'critical' as const })),
      ...resources.images.map(url => ({ type: 'image' as const, url, priority: 'high' as const }))
    ]

    await this.preloadBatch(items)
  }

  // Preload multiple resources with priority handling
  async preloadBatch(items: PreloadItem[]): Promise<PreloadResult[]> {
    // Sort by priority
    const sortedItems = items.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    const results: PreloadResult[] = []

    // Load critical resources first
    const critical = sortedItems.filter(item => item.priority === 'critical')
    for (const item of critical) {
      results.push(await this.preload(item))
    }

    return results
  }

  private async loadResource(item: PreloadItem, signal: AbortSignal, startTime: number): Promise<PreloadResult> {
    try {
      switch (item.type) {
        case 'image':
          return await this.loadImage(item, signal, startTime)
        case 'style':
          return await this.loadStyle(item, signal, startTime)
        case 'script':
          return await this.loadScript(item, signal, startTime)
        default:
          throw new Error(`Unsupported preload type: ${item.type}`)
      }
    } catch (error) {
      return {
        url: item.url,
        success: false,
        loadTime: performance.now() - startTime,
        error: error as Error
      }
    }
  }

  private loadImage(item: PreloadItem, signal: AbortSignal, startTime: number): Promise<PreloadResult> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      if (item.crossOrigin) {
        img.crossOrigin = 'anonymous'
      }

      const cleanup = () => {
        img.removeEventListener('load', onLoad)
        img.removeEventListener('error', onError)
        signal.removeEventListener('abort', onAbort)
      }

      const onLoad = () => {
        cleanup()
        resolve({
          url: item.url,
          success: true,
          loadTime: performance.now() - startTime
        })
      }

      const onError = () => {
        cleanup()
        reject(new Error(`Failed to load image: ${item.url}`))
      }

      const onAbort = () => {
        cleanup()
        reject(new Error(`Preload aborted: ${item.url}`))
      }

      signal.addEventListener('abort', onAbort)
      img.addEventListener('load', onLoad)
      img.addEventListener('error', onError)
      
      img.src = item.url
    })
  }

  private async loadStyle(item: PreloadItem, signal: AbortSignal, startTime: number): Promise<PreloadResult> {
    const response = await fetch(item.url, { signal })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    await response.text()
    
    return {
      url: item.url,
      success: true,
      loadTime: performance.now() - startTime
    }
  }

  private async loadScript(item: PreloadItem, signal: AbortSignal, startTime: number): Promise<PreloadResult> {
    const response = await fetch(item.url, { signal })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    await response.text()
    
    return {
      url: item.url,
      success: true,
      loadTime: performance.now() - startTime
    }
  }

  // Cancel all pending preloads
  cancelAll() {
    this.abortControllers.forEach(controller => controller.abort())
    this.abortControllers.clear()
    this.loadingPromises.clear()
  }

  // Get preload statistics
  getStats() {
    return {
      loaded: this.loadedResources.size,
      loading: this.loadingPromises.size,
      loadedUrls: Array.from(this.loadedResources)
    }
  }
}

export const preloader = new Preloader()
export type { PreloadItem, PreloadResult }