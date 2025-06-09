
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { renderGrid } from './GradientGrid';
import { renderBlobs, createGradientBlobs } from './GradientBlobs';
import { addFilmGrainEffect } from './FilmGrainEffect';
import { gradientColorPalettes } from '@/utils/gradientUtils';

interface GradientCanvasProps {
  className?: string;
}

export function GradientCanvas({ className }: GradientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const [shouldRender, setShouldRender] = useState(true);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Enhanced canvas setup with better pixel ratio handling
    const setCanvasDimensions = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(pixelRatio, pixelRatio);
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Animation variables with improved timing
    let animationFrameId: number;
    let time = 0;
    let lastFrameTime = 0;
    let lastGrainTime = 0;
    const grainInterval = 100; // Update grain less frequently for performance
    
    // Select a palette (could be randomized or based on theme)
    const paletteIndex = 0;  // Default to first palette
    const currentPalette = gradientColorPalettes[paletteIndex];
    
    // Create enhanced blobs with improved parameters
    const blobs = createGradientBlobs(canvas.width, canvas.height, isMobile, currentPalette);
    
    // Optimized render function with better timing and performance
    const render = (timestamp: number) => {
      // Skip frames for better performance when needed
      if (isMobile && timestamp - lastFrameTime < 32) { // ~30fps on mobile
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      lastFrameTime = timestamp;
      
      // Clear canvas with base color (dark slate)
      ctx.fillStyle = '#0a0a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid effect with improved parameters
      renderGrid(ctx, canvas.width, canvas.height, time);
      
      // Render blobs with enhanced visual effects
      renderBlobs(ctx, blobs, time, currentPalette);
      
      // Add film grain effect less frequently for better performance
      if (timestamp - lastGrainTime > grainInterval) {
        addFilmGrainEffect(ctx, canvas.width, canvas.height, 0.006, isMobile);
        lastGrainTime = timestamp;
      }
      
      // Progressive time for smoother animations
      time += 0.002; 
      
      // Request next frame if still rendering
      if (shouldRender) {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    
    // Start animation
    animationFrameId = requestAnimationFrame(render);
    
    // Handle visibility change to improve battery life
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setShouldRender(false);
        cancelAnimationFrame(animationFrameId);
      } else {
        setShouldRender(true);
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, shouldRender]);
  
  return (
    <motion.canvas 
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.3 }}
      className={`fixed inset-0 w-full h-full -z-10 ${className}`}
      style={{ filter: 'blur(50px)' }} 
    />
  );
}
