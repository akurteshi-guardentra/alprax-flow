import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAInstallHook {
  isInstallable: boolean
  isInstalled: boolean
  showInstallPrompt: () => Promise<void>
  dismissPrompt: () => void
}

export function usePWAInstall(): PWAInstallHook {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      // Check display mode
      const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches
      // Check if launched from home screen
      const isNavigatorStandalone = (window.navigator as any).standalone === true
      
      setIsInstalled(isDisplayStandalone || isNavigatorStandalone)
    }

    checkInstalled()

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const showInstallPrompt = async (): Promise<void> => {
    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA install accepted')
      } else {
        console.log('PWA install dismissed')
      }
      
      setInstallPrompt(null)
    } catch (error) {
      console.error('Error showing install prompt:', error)
    }
  }

  const dismissPrompt = (): void => {
    setInstallPrompt(null)
  }

  return {
    isInstallable: !!installPrompt && !isInstalled,
    isInstalled,
    showInstallPrompt,
    dismissPrompt
  }
}