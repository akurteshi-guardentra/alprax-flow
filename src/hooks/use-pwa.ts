import { useState, useEffect } from 'react'
import { logger } from '@/utils/logger'

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
  installPrompt: Event | null
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    installPrompt: null
  })

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true

    setPWAState(prev => ({ ...prev, isInstalled }))

    // Register service worker
    registerServiceWorker()

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setPWAState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e
      }))
      
      logger.info('App install prompt available')
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setPWAState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }))
      
      logger.info('App successfully installed')
    }

    // Listen for online/offline status
    const handleOnline = () => {
      setPWAState(prev => ({ ...prev, isOnline: true }))
      logger.info('App is now online')
    }

    const handleOffline = () => {
      setPWAState(prev => ({ ...prev, isOnline: false }))
      logger.info('App is now offline')
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        
        logger.info('Service Worker registered successfully', {
          scope: registration.scope
        })

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setPWAState(prev => ({ ...prev, isUpdateAvailable: true }))
                logger.info('App update available')
              }
            })
          }
        })

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
            setPWAState(prev => ({ ...prev, isUpdateAvailable: true }))
          }
        })

      } catch (error) {
        logger.error('Service Worker registration failed', { error: error.message })
      }
    }
  }

  const installApp = async (): Promise<boolean> => {
    const { installPrompt } = pwaState
    
    if (!installPrompt) {
      logger.warn('No install prompt available')
      return false
    }

    try {
      const promptEvent = installPrompt as BeforeInstallPromptEvent
      await promptEvent.prompt()
      
      const { outcome } = await promptEvent.userChoice
      
      if (outcome === 'accepted') {
        logger.info('User accepted app installation')
        return true
      } else {
        logger.info('User dismissed app installation')
        return false
      }
    } catch (error) {
      logger.error('App installation failed', { error: error.message })
      return false
    }
  }

  const updateApp = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      
      if (registration && registration.waiting) {
        // Tell the waiting service worker to skip waiting and become active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        
        // Reload the page to activate the new service worker
        window.location.reload()
        
        logger.info('App updated successfully')
      }
    }
  }

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      logger.info('Notification permission', { permission })
      return permission
    }
    return 'denied'
  }

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      })
      
      logger.info('Notification sent', { title })
      return notification
    }
    
    logger.warn('Notifications not available or not permitted')
    return null
  }

  const addToHomeScreen = () => {
    // For iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    if (isIOS && isSafari) {
      logger.info('iOS Safari detected - show manual install instructions')
      return {
        platform: 'ios',
        instructions: 'Tap the Share button and then "Add to Home Screen"'
      }
    }
    
    // For other browsers, use the install prompt
    return installApp()
  }

  const getConnectionInfo = () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      }
    }
    
    return null
  }

  const preloadCriticalResources = async () => {
    const criticalRoutes = ['/dashboard', '/payments', '/profile']
    
    try {
      await Promise.all(
        criticalRoutes.map(route => 
          fetch(route, { method: 'GET' }).catch(() => {})
        )
      )
      
      logger.info('Critical resources preloaded')
    } catch (error) {
      logger.warn('Failed to preload some resources', { error: error.message })
    }
  }

  return {
    ...pwaState,
    installApp,
    updateApp,
    requestNotificationPermission,
    sendNotification,
    addToHomeScreen,
    getConnectionInfo,
    preloadCriticalResources
  }
}