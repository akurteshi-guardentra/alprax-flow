interface PrefetchOptions {
  priority?: 'high' | 'low' | 'auto'
  as?: string
  crossOrigin?: 'anonymous' | 'use-credentials'
  integrity?: string
}

interface ResourceHint {
  href: string
  rel: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch'
  options?: PrefetchOptions
}

class PrefetchManager {
  private prefetchedResources = new Set<string>()
  private prefetchPromises = new Map<string, Promise<void>>()
  private intersectionObserver?: IntersectionObserver

  constructor() {
    this.setupIntersectionObserver()
  }

  // Preload critical resources
  preloadCritical(resources: string[]) {
    resources.forEach(resource => {
      this.preloadResource(resource, { priority: 'high' })
    })
  }

  // Prefetch resources that might be needed soon
  prefetchResource(href: string, options: PrefetchOptions = {}): Promise<void> {
    if (this.prefetchedResources.has(href)) {
      return this.prefetchPromises.get(href) || Promise.resolve()
    }

    this.prefetchedResources.add(href)

    const promise = this.createResourceHint({
      href,
      rel: 'prefetch',
      options
    })

    this.prefetchPromises.set(href, promise)
    return promise
  }

  // Preload critical resources
  preloadResource(href: string, options: PrefetchOptions = {}): Promise<void> {
    return this.createResourceHint({
      href,
      rel: 'preload',
      options
    })
  }

  // Preconnect to domains
  preconnectDomain(domain: string) {
    this.createResourceHint({
      href: domain,
      rel: 'preconnect'
    })
  }

  // DNS prefetch for domains
  dnsPrefetch(domain: string) {
    this.createResourceHint({
      href: domain,
      rel: 'dns-prefetch'
    })
  }

  // Prefetch route data when hovering over links
  prefetchOnHover(selector: string) {
    const links = document.querySelectorAll<HTMLAnchorElement>(selector)
    
    links.forEach(link => {
      let timeoutId: number

      link.addEventListener('mouseenter', () => {
        timeoutId = window.setTimeout(() => {
          const href = link.href
          if (href && !this.prefetchedResources.has(href)) {
            this.prefetchResource(href)
          }
        }, 100) // Small delay to avoid excessive prefetching
      })

      link.addEventListener('mouseleave', () => {
        clearTimeout(timeoutId)
      })
    })
  }

  // Prefetch resources when they come into viewport
  prefetchOnVisible(elements: HTMLElement[], resources: string[]) {
    if (!this.intersectionObserver) return

    elements.forEach((element, index) => {
      this.intersectionObserver?.observe(element)
      element.dataset.prefetchResource = resources[index] || ''
    })
  }

  // Smart prefetching based on user behavior
  enableSmartPrefetching() {
    // Prefetch common routes after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.prefetchCommonRoutes()
      }, 2000)
    })

    // Prefetch on user interaction
    document.addEventListener('click', () => {
      this.prefetchInteractionBasedResources()
    }, { once: true })
  }

  private setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const resource = entry.target.getAttribute('data-prefetch-resource')
              if (resource) {
                this.prefetchResource(resource)
                this.intersectionObserver?.unobserve(entry.target)
              }
            }
          })
        },
        { threshold: 0.1 }
      )
    }
  }

  private createResourceHint(hint: ResourceHint): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = hint.rel
      link.href = hint.href

      if (hint.options?.as) {
        link.as = hint.options.as
      }

      if (hint.options?.crossOrigin) {
        link.crossOrigin = hint.options.crossOrigin
      }

      if (hint.options?.integrity) {
        link.integrity = hint.options.integrity
      }

      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Failed to load resource: ${hint.href}`))

      document.head.appendChild(link)
    })
  }

  private prefetchCommonRoutes() {
    const commonRoutes = [
      '/dashboard',
      '/payments',
      '/profile',
      '/settings'
    ]

    commonRoutes.forEach(route => {
      this.prefetchResource(route)
    })
  }

  private prefetchInteractionBasedResources() {
    // Prefetch resources likely to be needed after user interaction
    const interactionResources = [
      '/api/exchange-rates',
      '/api/user/profile'
    ]

    interactionResources.forEach(resource => {
      this.prefetchResource(resource)
    })
  }

  // Clear prefetch cache
  clearCache() {
    this.prefetchedResources.clear()
    this.prefetchPromises.clear()
  }

  // Get prefetch statistics
  getStats() {
    return {
      prefetchedCount: this.prefetchedResources.size,
      pendingCount: this.prefetchPromises.size
    }
  }

  // Check network connection quality
  checkConnectionQuality(): boolean {
    const connection = (navigator as any).connection
    if (!connection) return true // Assume good connection if not available
    
    const goodConnection = connection.effectiveType === '4g' || 
                          connection.effectiveType === '3g'
    return goodConnection && !connection.saveData
  }
}

export const prefetchManager = new PrefetchManager()

// Export convenience functions
export const prefetchResources = (resources: string[]) => {
  resources.forEach(resource => prefetchManager.prefetchResource(resource))
}
export const hasGoodConnection = () => prefetchManager.checkConnectionQuality()
export type { PrefetchOptions, ResourceHint }