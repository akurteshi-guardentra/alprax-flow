import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, X } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'
import { logger } from '@/utils/logger'

export function UpdatePrompt() {
  const { isUpdateAvailable, updateApp } = usePWA()
  const [isVisible, setIsVisible] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isUpdateAvailable || !isVisible) {
    return null
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    
    try {
      await updateApp()
      logger.userAction('app_updated', 'UpdatePrompt')
    } catch (error) {
      logger.error('App update failed', { 
        component: 'UpdatePrompt',
        error: error.message 
      })
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    logger.userAction('update_prompt_dismissed', 'UpdatePrompt')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <Card className="border-green-500/20 bg-green-50/95 dark:bg-green-900/20 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
                  App Update Available
                </h3>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  A new version of the app is ready. Update now to get the latest features and improvements.
                </p>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
                    {isUpdating ? 'Updating...' : 'Update Now'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="text-xs text-green-700 dark:text-green-300"
                  >
                    Later
                  </Button>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 h-6 w-6 text-green-700 dark:text-green-300"
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