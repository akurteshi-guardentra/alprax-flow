
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface OptimizedGradientBackgroundProps {
  children: React.ReactNode;
}

export function OptimizedGradientBackground({ children }: OptimizedGradientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true);
  
  // Optimize rendering by tracking visibility
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      {/* Optimized background elements that only animate when visible */}
      {isVisible && (
        <>
          <div className="absolute inset-0 overflow-hidden">
            {/* Primary gradient blur */}
            <div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] rounded-full 
                  bg-gradient-to-r from-blue-600/30 to-purple-600/30 blur-[120px]" />
            
            {/* Secondary gradient blur */}
            <div className="absolute -bottom-[30%] -right-[20%] h-[80vh] w-[80vh] rounded-full 
                  bg-gradient-to-r from-teal-400/20 to-blue-500/20 blur-[120px]" />
            
            {/* Moving accent gradients - using CSS animations instead of JS for better performance */}
            <motion.div 
              className="absolute top-[20%] left-[30%] h-[30vh] w-[30vh] rounded-full 
                       bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20 blur-[80px]"
              animate={{
                y: [0, 30, 0],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: isMobile ? 8 : 12,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div 
              className="absolute bottom-[20%] right-[20%] h-[25vh] w-[25vh] rounded-full 
                       bg-gradient-to-br from-cyan-400/20 to-blue-500/20 blur-[80px]"
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: isMobile ? 10 : 15,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>

          {/* Subtle grid overlay - using CSS for performance */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.2]" />
          
          {/* Subtle noise texture */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
