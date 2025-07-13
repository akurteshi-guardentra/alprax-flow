
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { logger } from '@/utils/logger'
import { monitor } from '@/utils/monitoring'
import { MemoryManager } from '@/utils/memory-management'
import { NetworkResilience } from '@/utils/network-resilience'
import { errorTracker } from '@/utils/error-tracking'
import { performanceProfiler } from '@/utils/performance-profiler'
import { prefetchManager } from '@/utils/prefetch-utils'
import { preloader } from '@/utils/preloader'
import { browserDetection } from '@/utils/browser-detection'

// Initialize all production utilities
monitor.initialize()
MemoryManager.initialize()
NetworkResilience.initialize()
// ErrorTracker initializes itself when imported

// Initialize performance profiling
console.log('performanceProfiler:', performanceProfiler)
console.log('performanceProfiler.timing:', performanceProfiler.timing)
console.log('typeof performanceProfiler.timing:', typeof performanceProfiler.timing)
performanceProfiler.timing('app_init_start', performance.now())

// Check browser compatibility
const browserInfo = browserDetection.getBrowserInfo()
const compatibilityIssues = browserDetection.getCompatibilityIssues()
if (compatibilityIssues.length > 0) {
  logger.warn('Browser compatibility issues detected', {
    metadata: { issues: compatibilityIssues, browserInfo }
  })
}

// Enable smart prefetching
prefetchManager.enableSmartPrefetching()

// Preload critical resources
preloader.preloadCriticalPath({
  css: [],
  js: [],
  images: []
})

// Performance monitoring
const startTime = performance.now()

// Error boundary for uncaught errors
window.addEventListener('error', (event) => {
  logger.error('Uncaught error', {
    metadata: {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    }
  })
})

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    metadata: {
      reason: event.reason
    }
  })
})

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

// Use StrictMode only in development for better debugging
const isDevelopment = import.meta.env.DEV;

root.render(
  isDevelopment ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
);

// Log app startup time and performance metrics
window.addEventListener('load', async () => {
  const loadTime = performance.now() - startTime
  
  // Get core web vitals
  const coreWebVitals = await performanceProfiler.getCoreWebVitals()
  const memoryUsage = performanceProfiler.getMemoryUsage()
  const performanceSummary = performanceProfiler.getPerformanceSummary()
  
  logger.info('App loaded', { 
    metadata: { 
      loadTime,
      coreWebVitals,
      memoryUsage,
      performanceSummary,
      browserInfo
    }
  })
  
  performanceProfiler.timing('app_init_complete', loadTime)
})
