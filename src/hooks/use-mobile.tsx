
import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

/**
 * Hook to check if a media query matches
 * @param query Media query string (e.g. "(max-width: 640px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(query);
      
      // Set the initial value
      setMatches(mediaQuery.matches);
      
      // Define a callback function to handle changes
      const handleChange = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Add the callback as a listener for changes to the media query
      try {
        // Modern browsers
        mediaQuery.addEventListener('change', handleChange);
        return () => {
          mediaQuery.removeEventListener('change', handleChange);
        };
      } catch (e) {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => {
          mediaQuery.removeListener(handleChange);
        };
      }
    }
    
    // Default return for SSR
    return () => {};
  }, [query]);
  
  return matches;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    // Check if device is mobile or tablet based on user agent
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

      // Check if mobile device based on user agent
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      
      // Also check window width as fallback
      const isMobileWidth = window.innerWidth < MOBILE_BREAKPOINT
      const isTabletWidth = window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
      
      // Consider a device mobile if either the user agent suggests it or the screen is small
      setIsMobile(isMobileDevice || isMobileWidth || isTabletWidth)
    }

    // Initial check
    checkMobileDevice()

    // Listen to resize events
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const onChange = () => {
      checkMobileDevice()
    }
    
    mql.addEventListener("change", onChange)
    window.addEventListener("orientationchange", onChange)
    
    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener("orientationchange", onChange)
    }
  }, [])

  return !!isMobile
}

// Export useMobile alias for compatibility
export const useMobile = () => {
  const isMobile = useIsMobile();
  return { isMobile };
};

// For specific tablet detection if needed
export function useIsTablet() {
  const [isTablet, setIsTablet] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const checkTablet = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isTabletUserAgent = /ipad|android(?!.*mobile)/i.test(userAgent.toLowerCase())
      const isTabletWidth = window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
      
      setIsTablet(isTabletUserAgent || isTabletWidth)
    }

    checkTablet()
    
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const onChange = () => {
      checkTablet()
    }
    
    mql.addEventListener("change", onChange)
    window.addEventListener("orientationchange", onChange)
    
    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener("orientationchange", onChange)
    }
  }, [])

  return !!isTablet
}
