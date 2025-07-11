import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'
import { logger } from '@/utils/logger'

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [isVisible, setIsVisible] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)

  if (!isInstallable || isInstalled || !isVisible) {
    return null
  }

  const handleInstall = async () => {
    setIsInstalling(true)
    
    try {
      const success = await installApp()
      
      if (success) {
        setIsVisible(false)
        logger.userAction('app_installed', 'InstallPrompt')
      } else {
        logger.userAction('app_install_dismissed', 'InstallPrompt')
      }
    } catch (error) {
      logger.error('App installation failed', { 
        component: 'InstallPrompt',
        error: error.message 
      })
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    logger.userAction('install_prompt_dismissed', 'InstallPrompt')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <Card className="border-primary/20 bg-background/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  Install Alprax App
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Get faster access and work offline. Install the app on your device.
                </p>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    {isInstalling ? 'Installing...' : 'Install'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="text-xs"
                  >
                    Not now
                  </Button>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}