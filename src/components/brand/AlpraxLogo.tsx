import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
interface AlpraxLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'white';
  animated?: boolean;
  className?: string;
}
export function AlpraxLogo({
  size = 'md',
  variant = 'default',
  animated = false,
  className
}: AlpraxLogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };
  const variantClasses = {
    default: 'text-white',
    gradient: 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent',
    white: 'text-white'
  };
  const logoAnimation = {
    initial: {
      opacity: 0,
      scale: 0.8
    },
    animate: {
      opacity: 1,
      scale: 1
    },
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  };
  const Component = animated ? motion.div : 'div';
  return <Component className={cn("font-bold tracking-tight select-none text-center flex items-center justify-center w-full", sizeClasses[size], variantClasses[variant], className)} {...animated ? logoAnimation : {}}>
      <span className="font-display text-justify">Alprax</span>
      
    </Component>;
}

// Brand tagline component
export function AlpraxTagline({
  className
}: {
  className?: string;
}) {
  return <motion.p initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay: 0.3,
    duration: 0.5
  }} className={cn("text-white/70 text-sm font-medium text-center w-full", className)}>
      Send money anywhere, instantly
    </motion.p>;
}

// Complete brand header component
export function AlpraxBrandHeader({
  showTagline = true,
  size = 'lg',
  className
}: {
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  return <div className={cn("text-center flex flex-col items-center justify-center w-full", className)}>
      <AlpraxLogo size={size} variant="gradient" animated className="w-full text-center" />
      {showTagline && <AlpraxTagline className="mt-2 w-full text-center" />}
    </div>;
}