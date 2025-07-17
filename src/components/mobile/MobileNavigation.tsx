import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Send, Plus, User, Menu, X, Bell, Settings } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigationItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Send, label: 'Send', path: '/payments' },
  { icon: Plus, label: 'Add Funds', path: '/add-funds' },
  { icon: User, label: 'Profile', path: '/profile' },
]

const menuItems = [
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function MobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isActivePath = (path: string) => location.pathname === path

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-white/10 lg:hidden">
        <div className="flex items-center justify-around px-2 py-3 safe-area-pb">
          {navigationItems.map((item) => {
            const isActive = isActivePath(item.path)
            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200',
                  isActive 
                    ? 'text-blue-400 bg-blue-500/10' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className={cn('w-5 h-5 mb-1', isActive && 'text-blue-400')} />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            )
          })}
          
          {/* Menu Toggle */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col items-center justify-center px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X className="w-5 h-5 mb-1" /> : <Menu className="w-5 h-5 mb-1" />}
            <span className="text-xs font-medium">Menu</span>
          </motion.button>
        </div>
      </div>

      {/* Slide-up Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-white/10 rounded-t-2xl lg:hidden"
            >
              <div className="p-6 safe-area-pb">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {menuItems.map((item) => (
                    <motion.button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/60 text-sm text-center">
                    Version 1.0.0 • Made with ❤️ by Alprax
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}