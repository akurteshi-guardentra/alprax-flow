
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGestures } from "@/hooks/use-gestures";
import { Drawer } from "@/components/ui/drawer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WelcomeGradientBackground } from "@/components/welcome/WelcomeGradientBackground";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { WelcomeFeatures } from "@/components/welcome/WelcomeFeatures";
import { WelcomeTestimonials } from "@/components/welcome/WelcomeTestimonials";
import { WelcomeComparison } from "@/components/welcome/WelcomeComparison";
import { WelcomePricing } from "@/components/welcome/WelcomePricing";
import { WelcomeMobileContent } from "@/components/welcome/WelcomeMobileContent";
import { hapticFeedback } from "@/lib/haptics";

const Welcome = () => {
  const isMobile = useIsMobile();
  const gesture = useGestures();
  const scrollPositionRef = useRef({ lastScrollY: 0, ticking: false });
  
  useEffect(() => {
    if (isMobile) {
      // Apply optimized mobile settings
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
      
      let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      if (!appleMeta) {
        appleMeta = document.createElement('meta');
        appleMeta.setAttribute('name', 'apple-mobile-web-app-capable');
        document.head.appendChild(appleMeta);
      }
      appleMeta.setAttribute('content', 'yes');
      
      let themeMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeMeta) {
        themeMeta = document.createElement('meta');
        themeMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeMeta);
      }
      themeMeta.setAttribute('content', '#0f172a');
      
      document.body.style.overscrollBehavior = 'none';
      
      document.documentElement.setAttribute('style', 
        document.documentElement.getAttribute('style') || '' + 
        '-webkit-tap-highlight-color: rgba(0,0,0,0);'
      );
      
      // Add subtle haptic feedback when page loads
      setTimeout(() => {
        hapticFeedback('light');
      }, 100);
      
      // Scroll performance optimization
      const handleScroll = () => {
        const { lastScrollY, ticking } = scrollPositionRef.current;
        const currentScrollY = window.scrollY;
        
        if (!ticking && Math.abs(currentScrollY - lastScrollY) > 50) {
          window.requestAnimationFrame(() => {
            // Could add scroll-based animations here
            scrollPositionRef.current.ticking = false;
            scrollPositionRef.current.lastScrollY = currentScrollY;
          });
          
          scrollPositionRef.current.ticking = true;
        }
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.body.style.overscrollBehavior = '';
        const currentStyle = document.documentElement.getAttribute('style') || '';
        document.documentElement.setAttribute('style', 
          currentStyle.replace('-webkit-tap-highlight-color: rgba(0,0,0,0);', '')
        );
      };
    }
  }, [isMobile]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <WelcomeGradientBackground>
      <AnimatePresence>
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className={`relative z-10 px-0 sm:px-4 py-6 ${isMobile ? 'pt-safe pb-safe' : 'py-12'} 
               space-y-8 sm:space-y-20 max-w-7xl mx-auto overflow-x-hidden`}
        >
          <WelcomeHero />

          {isMobile ? (
            <Drawer>
              <WelcomeMobileContent />
            </Drawer>
          ) : (
            <motion.div className="space-y-16">
              <WelcomeFeatures />
              <WelcomeTestimonials />
              <WelcomeComparison />
              <WelcomePricing />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {isMobile && <MobileBottomNav />}
    </WelcomeGradientBackground>
  );
};

export default Welcome;
