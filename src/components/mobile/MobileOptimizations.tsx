import React, { useEffect } from 'react'
import { useMobileViewport } from '@/hooks/use-mobile-viewport'

interface MobileOptimizationsProps {
  children: React.ReactNode
}

export function MobileOptimizations({ children }: MobileOptimizationsProps) {
  const viewport = useMobileViewport()

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }
    // Set viewport meta tag for better mobile experience
    const setViewportMeta = () => {
      let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
      
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta')
        viewportMeta.name = 'viewport'
        document.head.appendChild(viewportMeta)
      }

      // Prevent zoom on iOS when focusing inputs
      const content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      viewportMeta.content = content
    }

    // Prevent pull-to-refresh on mobile
    const preventPullToRefresh = () => {
      let startY = 0
      
      const handleTouchStart = (e: TouchEvent) => {
        startY = e.touches[0].clientY
      }
      
      const handleTouchMove = (e: TouchEvent) => {
        const currentY = e.touches[0].clientY
        const diffY = currentY - startY
        
        // Prevent pull-to-refresh if scrolling down from top
        if (diffY > 0 && window.scrollY === 0) {
          e.preventDefault()
        }
      }
      
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchmove', handleTouchMove)
      }
    }

    // Set CSS custom properties for dynamic viewport
    const setCSSVariables = () => {
      const root = document.documentElement
      
      // Set viewport dimensions
      root.style.setProperty('--vh', `${viewport.height * 0.01}px`)
      root.style.setProperty('--vw', `${viewport.width * 0.01}px`)
      
      // Set device type classes
      root.classList.toggle('is-mobile', viewport.isMobile)
      root.classList.toggle('is-tablet', viewport.isTablet)
      root.classList.toggle('is-desktop', viewport.isDesktop)
      root.classList.toggle('is-landscape', viewport.orientation === 'landscape')
      root.classList.toggle('is-portrait', viewport.orientation === 'portrait')
      root.classList.toggle('keyboard-open', viewport.isKeyboardOpen)
    }

    // Optimize touch events
    const optimizeTouchEvents = () => {
      // Disable 300ms tap delay
      const style = document.createElement('style')
      style.textContent = `
        * {
          touch-action: manipulation;
        }
        
        input, textarea, select {
          touch-action: auto;
        }
      `
      document.head.appendChild(style)
      
      return () => {
        document.head.removeChild(style)
      }
    }

    // Setup performance optimizations
    const setupPerformanceOptimizations = () => {
      // Prefetch critical resources on idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Prefetch common routes
          const criticalRoutes = ['/dashboard', '/payments', '/profile']
          criticalRoutes.forEach(route => {
            const link = document.createElement('link')
            link.rel = 'prefetch'
            link.href = route
            document.head.appendChild(link)
          })
        })
      }

      return () => {
        // No cleanup needed for this simplified version
      }
    }

    setViewportMeta()
    setCSSVariables()
    
    const cleanupPullToRefresh = preventPullToRefresh()
    const cleanupTouchEvents = optimizeTouchEvents()
    const cleanupPerformance = setupPerformanceOptimizations()

    return () => {
      cleanupPullToRefresh()
      cleanupTouchEvents()
      cleanupPerformance()
    }
  }, [viewport])

  // Add CSS for safe area and mobile optimizations
  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }
    const style = document.createElement('style')
    style.textContent = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top, 0px);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        --safe-area-inset-left: env(safe-area-inset-left, 0px);
        --safe-area-inset-right: env(safe-area-inset-right, 0px);
      }
      
      .mobile-safe-area {
        padding-top: var(--safe-area-inset-top);
        padding-bottom: var(--safe-area-inset-bottom);
        padding-left: var(--safe-area-inset-left);
        padding-right: var(--safe-area-inset-right);
      }
      
      .mobile-viewport-height {
        height: calc(var(--vh, 1vh) * 100);
      }
      
      @media (max-width: 767px) {
        .mobile-optimized {
          -webkit-overflow-scrolling: touch;
          -webkit-tap-highlight-color: transparent;
        }
        
        .mobile-input {
          font-size: 16px; /* Prevent zoom on iOS */
        }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="mobile-optimized mobile-safe-area">
      {children}
    </div>
  )
}