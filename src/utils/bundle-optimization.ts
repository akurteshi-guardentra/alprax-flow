import React from 'react'
import { logger } from './logger'

// Lazy loading utilities
export const lazyLoad = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFn)
  
  return (props: React.ComponentProps<T>) => {
    return React.createElement(
      React.Suspense,
      { fallback: fallback ? React.createElement(fallback) : React.createElement('div', {}, 'Loading...') },
      React.createElement(LazyComponent, props)
    )
  }
}

// Preload utilities
export const preloadComponent = (importFn: () => Promise<any>) => {
  importFn().catch(error => {
    logger.warn('Component preload failed', { metadata: { error: error.message } })
  })
}

export const preloadRoute = (route: string) => {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = route
  document.head.appendChild(link)
  logger.info('Route preloaded', { metadata: { route } })
}

export const preloadCriticalResources = () => {
  const criticalResources = ['/fonts/inter.woff2', '/images/logo.svg']
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource
    
    if (resource.includes('.woff')) {
      link.as = 'font'
      link.crossOrigin = 'anonymous'
    } else if (resource.includes('.svg') || resource.includes('.png')) {
      link.as = 'image'
    }
    
    document.head.appendChild(link)
  })
  
  logger.info('Critical resources preloaded', { metadata: { count: criticalResources.length } })
}

export const isFeatureEnabled = (feature: string): boolean => {
  const features = {
    'advanced-analytics': true,
    'experimental-ui': false,
    'beta-features': false
  }
  
  return features[feature as keyof typeof features] || false
}