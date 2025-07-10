// Bundle size optimization utilities

// Lazy load expensive libraries only when needed
export const lazyImports = {
  // QR Code libraries
  qrCode: () => import('qrcode'),
  
  // Chart libraries (for analytics)
  recharts: () => import('recharts'),
  
  // Animation libraries
  framerMotion: () => import('framer-motion'),
  
  // Form validation
  zod: () => import('zod'),
  
  // Date utilities
  dateFns: () => import('date-fns'),
};

// Tree-shakable utility for loading libraries
export async function loadLibrary<T>(
  libraryLoader: () => Promise<T>,
  fallback?: () => T
): Promise<T> {
  try {
    return await libraryLoader();
  } catch (error) {
    console.warn('Failed to load library:', error);
    if (fallback) {
      return fallback();
    }
    throw error;
  }
}

// Code splitting helper for route-based chunks
export function createRouteChunk<T>(
  importFn: () => Promise<{ default: T }>,
  chunkName?: string
) {
  return () => {
    if (chunkName && process.env.NODE_ENV === 'development') {
      console.log(`Loading chunk: ${chunkName}`);
    }
    return importFn();
  };
}

// Bundle analyzer helper (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    const estimate = {
      components: document.querySelectorAll('[data-component]').length,
      scripts: document.scripts.length,
      stylesheets: document.styleSheets.length,
      images: document.images.length
    };
    
    console.log('Bundle composition estimate:', estimate);
    return estimate;
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalResources = [
    '/assets/logo.svg',
    '/fonts/inter-var.woff2'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.woff2') ? 'font' : 'image';
    if (link.as === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
}

// Performance budget monitoring
export function checkPerformanceBudget() {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    const isSlowConnection = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
    
    if (isSlowConnection) {
      console.warn('Slow connection detected, consider loading minimal resources');
      return { slow: true, effectiveType: connection.effectiveType };
    }
  }
  
  return { slow: false };
}