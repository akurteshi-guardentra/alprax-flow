interface BrowserInfo {
  name: string
  version: string
  isSupported: boolean
  os: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  prefersReducedMotion: boolean
  features: {
    webgl: boolean
    localStorage: boolean
    indexedDB: boolean
    serviceWorker: boolean
    pushNotifications: boolean
    webRTC: boolean
  }
}

interface SecurityContext {
  isSecureContext: boolean
  hasHttps: boolean
  hasTrustedTypes: boolean
  hasCSP: boolean
}

class BrowserDetection {
  private browserInfo: BrowserInfo | null = null
  private securityContext: SecurityContext | null = null

  getBrowserInfo(): BrowserInfo {
    if (this.browserInfo) return this.browserInfo

    const userAgent = navigator.userAgent
    let name = 'Unknown'
    let version = 'Unknown'
    let os = 'Unknown'

    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      name = 'Chrome'
      version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown'
    } else if (userAgent.includes('Firefox')) {
      name = 'Firefox'
      version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown'
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari'
      version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown'
    } else if (userAgent.includes('Edg')) {
      name = 'Edge'
      version = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown'
    }

    // Detect OS
    if (userAgent.includes('Windows')) os = 'Windows'
    else if (userAgent.includes('Mac')) os = 'macOS'
    else if (userAgent.includes('Linux')) os = 'Linux'
    else if (userAgent.includes('Android')) os = 'Android'
    else if (userAgent.includes('iOS')) os = 'iOS'

    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android(?=.*Mobile)|Tablet/i.test(userAgent)
    const isDesktop = !isMobile && !isTablet

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Check feature support
    const features = {
      webgl: this.supportsWebGL(),
      localStorage: this.supportsLocalStorage(),
      indexedDB: this.supportsIndexedDB(),
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      webRTC: 'RTCPeerConnection' in window
    }

    // Determine if browser is supported
    const isSupported = this.isBrowserSupported(name, version, features)

    this.browserInfo = { name, version, isSupported, os, isMobile, isTablet, isDesktop, prefersReducedMotion, features }
    return this.browserInfo
  }

  getSecurityContext(): SecurityContext {
    if (this.securityContext) return this.securityContext

    this.securityContext = {
      isSecureContext: window.isSecureContext || false,
      hasHttps: location.protocol === 'https:',
      hasTrustedTypes: 'trustedTypes' in window,
      hasCSP: this.hasContentSecurityPolicy()
    }

    return this.securityContext
  }

  private supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch {
      return false
    }
  }

  private supportsLocalStorage(): boolean {
    try {
      const test = 'test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  private supportsIndexedDB(): boolean {
    return 'indexedDB' in window
  }

  private hasContentSecurityPolicy(): boolean {
    const metaTags = document.getElementsByTagName('meta')
    for (let i = 0; i < metaTags.length; i++) {
      if (metaTags[i].getAttribute('http-equiv') === 'Content-Security-Policy') {
        return true
      }
    }
    return false
  }

  private isBrowserSupported(name: string, version: string, features: BrowserInfo['features']): boolean {
    const majorVersion = parseInt(version.split('.')[0])
    
    // Minimum supported versions
    const minVersions: Record<string, number> = {
      Chrome: 80,
      Firefox: 75,
      Safari: 13,
      Edge: 80
    }

    const minVersion = minVersions[name]
    if (!minVersion) return false

    // Check version requirement
    const versionSupported = majorVersion >= minVersion

    // Check critical features
    const criticalFeatures = features.localStorage && features.serviceWorker

    return versionSupported && criticalFeatures
  }

  getCompatibilityIssues(): string[] {
    const info = this.getBrowserInfo()
    const security = this.getSecurityContext()
    const issues: string[] = []

    if (!info.isSupported) {
      issues.push(`Browser ${info.name} ${info.version} is not fully supported`)
    }

    if (!info.features.localStorage) {
      issues.push('Local storage is not available')
    }

    if (!info.features.serviceWorker) {
      issues.push('Service workers are not supported')
    }

    if (!security.isSecureContext) {
      issues.push('Application must be served over HTTPS')
    }

    if (!info.features.indexedDB) {
      issues.push('IndexedDB is not available - offline features limited')
    }

    return issues
  }

  getRecommendations(): string[] {
    const info = this.getBrowserInfo()
    const recommendations: string[] = []

    if (info.name === 'Safari' && parseInt(info.version.split('.')[0]) < 14) {
      recommendations.push('Consider updating Safari for better performance')
    }

    if (info.name === 'Firefox' && parseInt(info.version.split('.')[0]) < 85) {
      recommendations.push('Update Firefox for improved security features')
    }

    if (!info.features.pushNotifications) {
      recommendations.push('Push notifications are not available in this browser')
    }

    return recommendations
  }
}

export const browserDetection = new BrowserDetection()

// Export convenience functions
export const getBrowserInfo = () => browserDetection.getBrowserInfo()
export const isBrowserSupported = () => browserDetection.getBrowserInfo().isSupported

export type { BrowserInfo, SecurityContext }