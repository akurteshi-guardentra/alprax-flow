
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlpraxBrandHeader } from '@/components/brand/AlpraxLogo';
import { TestnetBanner } from '@/components/TestnetBanner';

interface UnifiedLayoutProps {
  children: ReactNode;
  showBrand?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

export function UnifiedLayout({ 
  children, 
  showBrand = false, 
  showBackButton = false,
  onBack,
  title,
  subtitle
}: UnifiedLayoutProps) {
  return (
    <div className="min-h-screen modern-gradient relative overflow-hidden">
      <TestnetBanner />
      
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-500/15 rounded-full blur-xl animate-modern-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {showBrand && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <AlpraxBrandHeader size="lg" />
            </motion.div>
          )}

          {(title || showBackButton) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-8"
            >
              {showBackButton && onBack && (
                <button 
                  onClick={onBack}
                  className="glass-card-hover text-white border-none px-4 py-2 rounded-lg"
                >
                  ← Back
                </button>
              )}
              {title && (
                <div>
                  <h1 className="text-2xl font-bold text-gradient-modern">{title}</h1>
                  {subtitle && <p className="text-white/70 mt-1">{subtitle}</p>}
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
