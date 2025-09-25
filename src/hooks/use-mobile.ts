/**
 * Enhanced mobile detection and optimization hook
 */

import { useState, useEffect, useCallback } from 'react';

interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  orientation: 'portrait' | 'landscape';
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  devicePixelRatio: number;
  connectionType: 'slow' | 'fast' | 'unknown';
}

// Breakpoints matching Tailwind CSS
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

function getScreenSize(width: number): MobileInfo['screenSize'] {
  if (width < BREAKPOINTS.sm) return 'small';
  if (width < BREAKPOINTS.md) return 'medium';
  if (width < BREAKPOINTS.lg) return 'large';
  return 'xlarge';
}

function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

function getSafeAreaInsets() {
  if (typeof window === 'undefined' || !window.CSS?.supports?.('padding: env(safe-area-inset-top)')) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  // Create a temporary element to measure safe area insets
  const testEl = document.createElement('div');
  testEl.style.position = 'fixed';
  testEl.style.top = '0';
  testEl.style.left = '0';
  testEl.style.width = '1px';
  testEl.style.height = '1px';
  testEl.style.paddingTop = 'env(safe-area-inset-top)';
  testEl.style.paddingBottom = 'env(safe-area-inset-bottom)';
  testEl.style.paddingLeft = 'env(safe-area-inset-left)';
  testEl.style.paddingRight = 'env(safe-area-inset-right)';
  testEl.style.visibility = 'hidden';
  
  document.body.appendChild(testEl);
  
  const computedStyle = window.getComputedStyle(testEl);
  const insets = {
    top: parseFloat(computedStyle.paddingTop) || 0,
    bottom: parseFloat(computedStyle.paddingBottom) || 0,
    left: parseFloat(computedStyle.paddingLeft) || 0,
    right: parseFloat(computedStyle.paddingRight) || 0,
  };
  
  document.body.removeChild(testEl);
  return insets;
}

function getConnectionType(): 'slow' | 'fast' | 'unknown' {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'unknown';
  }

  const connection = (navigator as any).connection;
  if (!connection) return 'unknown';

  // Check effective connection type
  const effectiveType = connection.effectiveType;
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
  if (effectiveType === '3g' || effectiveType === '4g') return 'fast';

  // Fallback to downlink speed
  const downlink = connection.downlink;
  if (downlink < 1.5) return 'slow';
  if (downlink >= 1.5) return 'fast';

  return 'unknown';
}

function detectMobileInfo(): MobileInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      isIOS: false,
      isAndroid: false,
      screenSize: 'large',
      orientation: 'portrait',
      safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
      devicePixelRatio: 1,
      connectionType: 'unknown',
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Device detection
  const isIOS = /ipad|iphone|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isTablet = (
    (/ipad/.test(userAgent)) ||
    (/android/.test(userAgent) && !/mobile/.test(userAgent)) ||
    (width >= BREAKPOINTS.md && hasTouch)
  );
  const isMobile = (
    hasTouch && 
    (width < BREAKPOINTS.md || /mobi|android/i.test(userAgent)) &&
    !isTablet
  );
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: hasTouch,
    isIOS,
    isAndroid,
    screenSize: getScreenSize(width),
    orientation: getOrientation(),
    safeAreaInsets: getSafeAreaInsets(),
    devicePixelRatio: window.devicePixelRatio || 1,
    connectionType: getConnectionType(),
  };
}

// Media query hook for backward compatibility
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(query);
      setMatches(mediaQuery.matches);
      
      const handleChange = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      try {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } catch (e) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
    return () => {};
  }, [query]);
  
  return matches;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < BREAKPOINTS.md;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

// Backward compatibility hook
export function useMobile() {
  const isMobile = useIsMobile();
  return { isMobile };
}

export function useMobileInfo(): MobileInfo {
  const [mobileInfo, setMobileInfo] = useState(detectMobileInfo);

  const updateMobileInfo = useCallback(() => {
    setMobileInfo(detectMobileInfo());
  }, []);

  useEffect(() => {
    // Update on resize and orientation change
    window.addEventListener('resize', updateMobileInfo);
    window.addEventListener('orientationchange', updateMobileInfo);
    
    // Update on network change
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', updateMobileInfo);
    }

    // Update on visibility change (for safe area insets that might change)
    document.addEventListener('visibilitychange', updateMobileInfo);

    return () => {
      window.removeEventListener('resize', updateMobileInfo);
      window.removeEventListener('orientationchange', updateMobileInfo);
      
      if ('connection' in navigator) {
        (navigator as any).connection?.removeEventListener('change', updateMobileInfo);
      }
      
      document.removeEventListener('visibilitychange', updateMobileInfo);
    };
  }, [updateMobileInfo]);

  return mobileInfo;
}

// Hook for responsive breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<keyof typeof BREAKPOINTS | 'xs'>(() => {
    if (typeof window === 'undefined') return 'lg';
    
    const width = window.innerWidth;
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= BREAKPOINTS.xl) setBreakpoint('xl');
      else if (width >= BREAKPOINTS.lg) setBreakpoint('lg');
      else if (width >= BREAKPOINTS.md) setBreakpoint('md');
      else if (width >= BREAKPOINTS.sm) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl',
  };
}

// Hook for device capabilities
export function useDeviceCapabilities() {
  const mobileInfo = useMobileInfo();
  
  return {
    ...mobileInfo,
    supportsTouch: mobileInfo.isTouchDevice,
    supportsHover: !mobileInfo.isTouchDevice,
    prefersReducedMotion: typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false,
    supportsWebP: typeof window !== 'undefined' 
      ? window.HTMLCanvasElement?.prototype?.toDataURL?.('image/webp')?.indexOf('webp') > -1
      : false,
    isRetina: mobileInfo.devicePixelRatio > 1,
    isSlowConnection: mobileInfo.connectionType === 'slow',
    hasNotchOrDynamicIsland: mobileInfo.safeAreaInsets.top > 24, // iOS devices with notch/Dynamic Island
  };
}

// Utility functions
export const mobileUtils = {
  isMobileDevice: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < BREAKPOINTS.md;
  },
  
  getTouchTargetSize: (isMobile: boolean) => {
    return isMobile ? 'min-h-[44px] min-w-[44px]' : 'min-h-[32px] min-w-[32px]';
  },
  
  getOptimalImageSize: (containerWidth: number, devicePixelRatio: number) => {
    return Math.ceil(containerWidth * devicePixelRatio);
  },
  
  shouldUseNativeSelect: (isMobile: boolean, isTouch: boolean) => {
    return isMobile && isTouch;
  },
  
  getScrollbarWidth: () => {
    if (typeof window === 'undefined') return 0;
    
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    
    const inner = document.createElement('div');
    outer.appendChild(inner);
    
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode?.removeChild(outer);
    
    return scrollbarWidth;
  },
};