interface PreloadConfig {
  css: string[]
  js: string[]
  images: string[]
  fonts?: string[]
}

class BundleOptimizer {
  private loadedChunks = new Set<string>()
  private preloadedResources = new Set<string>()

  async preloadRoute(routeName: string): Promise<void> {
    if (this.loadedChunks.has(routeName)) return

    try {
      const chunkMap: Record<string, () => Promise<any>> = {
        'dashboard': () => import('@/pages/Dashboard'),
        'payments': () => import('@/pages/Payments'),
        'profile': () => import('@/pages/Profile'),
        'analytics': () => import('@/pages/Analytics'),
        'settings': () => import('@/pages/Settings')
      }

      const importFn = chunkMap[routeName]
      if (importFn) {
        await importFn()
        this.loadedChunks.add(routeName)
      }
    } catch (error) {
      console.warn(`Failed to preload route ${routeName}:`, error)
    }
  }

  async preloadResources(config: PreloadConfig): Promise<void> {
    const preloadResource = (href: string, as: string, type?: string) => {
      if (this.preloadedResources.has(href)) return

      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      if (type) link.type = type

      link.onload = () => this.preloadedResources.add(href)
      link.onerror = () => console.warn(`Failed to preload ${href}`)

      document.head.appendChild(link)
    }

    config.css.forEach(href => preloadResource(href, 'style'))
    config.js.forEach(href => preloadResource(href, 'script'))
    config.images.forEach(href => preloadResource(href, 'image'))
    config.fonts?.forEach(href => preloadResource(href, 'font', 'font/woff2'))
  }

  enableSmartPrefetching(): void {
    const prefetchOnHover = (selector: string, routeName: string) => {
      const elements = document.querySelectorAll(selector)
      
      elements.forEach(element => {
        const handleMouseEnter = () => {
          this.preloadRoute(routeName)
        }

        element.addEventListener('mouseenter', handleMouseEnter, { once: true })
      })
    }

    const routeSelectors = [
      { selector: 'a[href="/dashboard"]', route: 'dashboard' },
      { selector: 'a[href="/payments"]', route: 'payments' },
      { selector: 'a[href="/profile"]', route: 'profile' },
      { selector: 'a[href="/analytics"]', route: 'analytics' },
      { selector: 'a[href="/settings"]', route: 'settings' }
    ]

    setTimeout(() => {
      routeSelectors.forEach(({ selector, route }) => {
        prefetchOnHover(selector, route)
      })
    }, 1000)

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            const route = element.getAttribute('data-prefetch-route')
            if (route) {
              this.preloadRoute(route)
              observer.unobserve(element)
            }
          }
        })
      }, { threshold: 0.1 })

      setTimeout(() => {
        document.querySelectorAll('[data-prefetch-route]').forEach(el => {
          observer.observe(el)
        })
      }, 2000)
    }
  }

  cleanupUnusedResources(): void {
    const preloadLinks = document.querySelectorAll('link[rel="preload"]')
    preloadLinks.forEach(link => {
      const href = (link as HTMLLinkElement).href
      if (!this.preloadedResources.has(href)) {
        link.remove()
      }
    })

    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
      
      if (memoryUsage > 0.8) {
        this.loadedChunks.clear()
      }
    }
  }

  getStats(): {
    loadedChunks: number
    preloadedResources: number
    memoryUsage?: number
  } {
    const stats = {
      loadedChunks: this.loadedChunks.size,
      preloadedResources: this.preloadedResources.size
    }

    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        ...stats,
        memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
      }
    }

    return stats
  }

  initialize(): void {
    this.enableSmartPrefetching()

    setInterval(() => {
      this.cleanupUnusedResources()
    }, 5 * 60 * 1000)

    setTimeout(() => {
      this.preloadRoute('dashboard')
      this.preloadRoute('payments')
    }, 3000)
  }
}

export const bundleOptimizer = new BundleOptimizer()
export type { PreloadConfig }