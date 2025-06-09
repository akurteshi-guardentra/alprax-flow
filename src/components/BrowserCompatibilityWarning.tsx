import React from 'react';
import { useBrowserSupport } from '@/hooks/use-browser-support';
import { AlertTriangle, X, Chrome, Globe } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface BrowserCompatibilityWarningProps {
  showUnsupportedWarning?: boolean;  // Show warning for unsupported browsers
  showOptimalWarning?: boolean;      // Show suggestions for optimal experience 
  className?: string;
}

export function BrowserCompatibilityWarning({
  showUnsupportedWarning = true,
  showOptimalWarning = false,
  className
}: BrowserCompatibilityWarningProps) {
  const { 
    browserInfo, 
    isSupported, 
    isLoading,
    browserName,
    prefersReducedMotion
  } = useBrowserSupport();
  
  const [dismissed, setDismissed] = useState(false);
  
  // Don't show anything if loading, supported, or dismissed
  if (isLoading || (isSupported && !showOptimalWarning) || dismissed) {
    return null;
  }
  
  // If browser is unsupported and we should show warnings
  if (!isSupported && showUnsupportedWarning) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          className={`fixed top-0 left-0 right-0 z-50 p-4 bg-destructive text-white ${className}`}
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  Your browser ({browserName}) is not fully supported.
                </p>
                <p className="text-sm opacity-90">
                  For the best experience, please use a modern browser.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a 
                href="https://www.google.com/chrome/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden sm:flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white rounded-md px-3 py-1 text-sm"
              >
                <Chrome className="h-4 w-4 mr-1" />
                <span>Chrome</span>
              </a>              <a 
                href="https://www.mozilla.org/firefox/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden sm:flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white rounded-md px-3 py-1 text-sm"
              >
                <Globe className="h-4 w-4 mr-1" />
                <span>Firefox</span>
              </a>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
  
  // Show optimization suggestions if requested
  if (showOptimalWarning && browserInfo) {
    // Only show if there are specific optimization suggestions for this browser
    if (
      (browserName === 'Safari' && browserInfo.os === 'iOS') ||
      browserInfo.name === 'Internet Explorer' ||
      (browserInfo.name === 'Edge' && parseInt(browserInfo.version) < 79)
    ) {
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            className={`fixed bottom-0 left-0 right-0 z-50 p-3 bg-warning/90 text-white ${className}`}
          >
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  For optimal performance in {browserName}, consider adjusting your settings.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }
  }
  
  return null;
}
