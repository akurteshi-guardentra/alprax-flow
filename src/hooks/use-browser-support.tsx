import { useState, useEffect } from 'react';
import { getBrowserInfo, BrowserInfo, isBrowserSupported } from '@/utils/browser-detection';

/**
 * Hook for detecting browser capabilities and applying optimizations
 * @returns Browser information and support status
 */
export function useBrowserSupport() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkBrowserSupport() {
      setIsLoading(true);
      try {
        const info = await getBrowserInfo();
        setBrowserInfo(info);
        
        const supported = await isBrowserSupported();
        setIsSupported(supported);
      } catch (error) {
        console.error('Error detecting browser capabilities:', error);
        // Assume supported in case of error to not block users unnecessarily
        setIsSupported(true);
      } finally {
        setIsLoading(false);
      }
    }

    checkBrowserSupport();
  }, []);

  // Helper function to conditionally apply fixes for specific browsers
  const applyBrowserFix = <T extends unknown>(
    fixes: Partial<Record<string, T>>,
    defaultValue: T
  ): T => {
    if (!browserInfo) return defaultValue;
    
    // Check if there's a fix for the specific browser and version
    const versionSpecificKey = `${browserInfo.name}-${browserInfo.version}`;
    if (fixes[versionSpecificKey]) return fixes[versionSpecificKey] as T;
    
    // Check if there's a fix for the browser family
    if (fixes[browserInfo.name]) return fixes[browserInfo.name] as T;
    
    // Check if there's a fix for the OS
    if (fixes[browserInfo.os]) return fixes[browserInfo.os] as T;
    
    // Check if there's a fix for mobile/tablet/desktop
    if (browserInfo.isMobile && fixes['mobile']) return fixes['mobile'] as T;
    if (browserInfo.isTablet && fixes['tablet']) return fixes['tablet'] as T;
    if (browserInfo.isDesktop && fixes['desktop']) return fixes['desktop'] as T;
    
    return defaultValue;
  };

  return {
    browserInfo,
    isSupported,
    isLoading,
    applyBrowserFix,
    isMobileDevice: browserInfo?.isMobile || false,
    isTabletDevice: browserInfo?.isTablet || false,
    isDesktopDevice: browserInfo?.isDesktop || false,
    prefersReducedMotion: browserInfo?.prefersReducedMotion || false,
    browserName: browserInfo?.name || 'unknown',
    browserVersion: browserInfo?.version || 'unknown',
    operatingSystem: browserInfo?.os || 'unknown',
  };
}
