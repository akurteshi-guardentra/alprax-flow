import React, { useState, useEffect } from 'react'

interface ViewportInfo {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
  isKeyboardOpen: boolean
  safeArea: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export function useMobileViewport(): ViewportInfo {
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
  const [viewport, setViewport] = useState<ViewportInfo>(() => {
    const width = isBrowser ? window.innerWidth : 1024
    const height = isBrowser ? window.innerHeight : 768
    
    return {
      width,
      height,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      orientation: width > height ? 'landscape' : 'portrait',
      isKeyboardOpen: false,
      safeArea: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }
    let initialHeight = window.innerHeight

    const updateViewport = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const heightDiff = initialHeight - height
      
      // Detect if keyboard is open (significant height reduction on mobile)
      const isKeyboardOpen = width < 768 && heightDiff > 150

      // Get safe area insets
      const computedStyle = getComputedStyle(document.documentElement)
      const safeArea = {
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0')
      }

      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: width > height ? 'landscape' : 'portrait',
        isKeyboardOpen,
        safeArea
      })
    }

    const handleResize = () => {
      updateViewport()
    }

    const handleOrientationChange = () => {
      // Wait for orientation change to complete
      setTimeout(updateViewport, 100)
    }

    // Update initial height on focus (when keyboard closes)
    const handleFocus = () => {
      setTimeout(() => {
        initialHeight = window.innerHeight
        updateViewport()
      }, 300)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('focus', handleFocus)

    // Set CSS custom properties for safe areas
    const setCSSProperties = () => {
      const root = document.documentElement
      if (typeof window !== 'undefined' && 'CSS' in window && 'supports' in (window as any).CSS) {
        if ((window.CSS as any).supports('padding-top: env(safe-area-inset-top)')) {
          root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)')
          root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)')
          root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)')
          root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)')
        }
      }
    }

    setCSSProperties()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return viewport
}