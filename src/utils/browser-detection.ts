/**
 * Browser detection utility for cross-browser optimizations
 * This allows us to apply specific fixes or optimizations for different browsers
 */

export interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  supportsWebP: boolean;
  supportsWasm: boolean;
  supportsPaymentRequest: boolean;
  supportsTouchEvents: boolean;
  prefersReducedMotion: boolean;
}

/**
 * Detect browser type and version
 */
function detectBrowser(): { name: string; version: string } {
  const userAgent = navigator.userAgent;
  let name = 'unknown';
  let version = 'unknown';

  // Detect browser name
  if (userAgent.indexOf('Firefox') > -1) {
    name = 'Firefox';
  } else if (userAgent.indexOf('SamsungBrowser') > -1) {
    name = 'Samsung Browser';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    name = 'Opera';
  } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg/') > -1) {
    name = 'Edge';
  } else if (userAgent.indexOf('Chrome') > -1) {
    name = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    name = 'Safari';
  } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
    name = 'Internet Explorer';
  }

  // Try to get version
  let match;
  switch (name) {
    case 'Firefox':
      match = userAgent.match(/Firefox\/([0-9.]+)/);
      break;
    case 'Samsung Browser':
      match = userAgent.match(/SamsungBrowser\/([0-9.]+)/);
      break;
    case 'Opera':
      match = userAgent.match(/(?:Opera|OPR)\/([0-9.]+)/);
      break;
    case 'Edge':
      match = userAgent.match(/(?:Edge|Edg)\/([0-9.]+)/);
      break;
    case 'Chrome':
      match = userAgent.match(/Chrome\/([0-9.]+)/);
      break;
    case 'Safari':
      match = userAgent.match(/Version\/([0-9.]+).*Safari/);
      break;
    case 'Internet Explorer':
      match = userAgent.match(/(?:MSIE |rv:)([0-9.]+)/);
      break;
  }

  if (match && match[1]) {
    version = match[1];
  }

  return { name, version };
}

/**
 * Detect operating system
 */
function detectOS(): string {
  const userAgent = navigator.userAgent;

  if (/Windows/.test(userAgent)) {
    return 'Windows';
  } else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
    return 'MacOS';
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    return 'iOS';
  } else if (/Android/.test(userAgent)) {
    return 'Android';
  } else if (/Linux/.test(userAgent)) {
    return 'Linux';
  }

  return 'Unknown';
}

/**
 * Detect if the device is mobile
 */
function detectMobile(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent);
}

/**
 * Detect if the device is a tablet
 */
function detectTablet(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return /ipad|android(?!.*mobile)/.test(userAgent) || 
    (navigator.maxTouchPoints > 0 && /macintosh/.test(userAgent));
}

/**
 * Check if browser supports WebP image format
 */
async function supportsWebP(): Promise<boolean> {
  if (!self.createImageBitmap) return false;

  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());
  
  try {
    return createImageBitmap(blob).then(() => true, () => false);
  } catch (e) {
    return false;
  }
}

/**
 * Check if browser supports WebAssembly
 */
function supportsWasm(): boolean {
  try {
    return typeof WebAssembly === 'object' && 
      typeof WebAssembly.compile === 'function';
  } catch (e) {
    return false;
  }
}

/**
 * Check if browser supports Payment Request API
 */
function supportsPaymentRequest(): boolean {
  return 'PaymentRequest' in window;
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Get complete browser information
 */
export async function getBrowserInfo(): Promise<BrowserInfo> {
  const { name, version } = detectBrowser();
  const os = detectOS();
  const isMobile = detectMobile();
  const isTablet = detectTablet();
  const isDesktop = !isMobile && !isTablet;
  const webpSupport = await supportsWebP();
  
  return {
    name,
    version,
    os,
    isMobile,
    isTablet,
    isDesktop,
    supportsWebP: webpSupport,
    supportsWasm: supportsWasm(),
    supportsPaymentRequest: supportsPaymentRequest(),
    supportsTouchEvents: 'ontouchstart' in window,
    prefersReducedMotion: prefersReducedMotion()
  };
}

/**
 * Flag to check if running within an iOS WebView (for specific fixes)
 */
export function isIOSWebView(): boolean {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isWebkit = /WebKit/.test(userAgent);
  const isNotChrome = !/Chrome/.test(userAgent); 
  const isNotSafari = !/Safari/.test(userAgent);
  
  return isIOS && isWebkit && isNotChrome && isNotSafari;
}

/**
 * Get a list of known browser issues and workarounds for the current browser
 */
export async function getBrowserIssues(): Promise<{ issue: string, workaround: string }[]> {
  const { name, version, os } = await getBrowserInfo();
  const issues: { issue: string, workaround: string }[] = [];
  
  // Check for specific known issues
  if (name === 'Safari' && os === 'iOS') {
    issues.push({
      issue: 'iOS Safari may have issues with position:fixed inputs when the keyboard is visible',
      workaround: 'Use position:absolute instead and handle scroll manually'
    });
    
    issues.push({
      issue: 'iOS Safari has inconsistent behavior with vh units',
      workaround: 'Use a JS-based solution for full-height elements instead of 100vh'
    });
  }
  
  if (name === 'Firefox') {
    issues.push({
      issue: 'Firefox has less consistent backdrop-filter support',
      workaround: 'Provide fallback styles when backdrop-filter is used'
    });
  }
  
  if (name === 'Internet Explorer') {
    issues.push({
      issue: 'Internet Explorer is not supported',
      workaround: 'Redirect to browser upgrade page'
    });
  }
  
  // TODO: Add more browser-specific issues as they are discovered
  
  return issues;
}

/**
 * Check if the current browser is supported by our application
 */
export async function isBrowserSupported(): Promise<boolean> {
  const { name, version } = await getBrowserInfo();
  
  // Minimum supported versions
  const minVersions: Record<string, string> = {
    'Chrome': '70',
    'Firefox': '68',
    'Safari': '12',
    'Edge': '79',
    'Opera': '60',
    'Samsung Browser': '10',
  };
  
  // Not supported browsers
  if (name === 'Internet Explorer') {
    return false;
  }
  
  // If we don't have a minimum version defined or can't determine the browser, assume it's supported
  if (!minVersions[name] || version === 'unknown') {
    return true;
  }
  
  // Compare versions
  return parseFloat(version) >= parseFloat(minVersions[name]);
}
