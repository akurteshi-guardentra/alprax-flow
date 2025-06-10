
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

export function ModernCard({ 
  children, 
  className, 
  variant = 'default',
  size = 'md',
  interactive = false,
  animate = true,
  onClick,
  ...props 
}: ModernCardProps) {
  const baseClasses = "rounded-xl border backdrop-blur-sm transition-all duration-250";
  
  const variantClasses = {
    default: "bg-white/5 border-white/10 hover:bg-white/10",
    glass: "bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/8",
    gradient: "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/20 hover:from-blue-500/15 hover:to-purple-500/15",
    solid: "bg-slate-800 border-slate-700 hover:bg-slate-700"
  };
  
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };
  
  const interactiveClasses = (interactive || onClick) 
    ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]" 
    : "";

  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" }
  } : {};

  return (
    <Component
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        interactiveClasses,
        className
      )}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
}

// Sub-components for better composition
export function ModernCardHeader({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function ModernCardTitle({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-xl font-semibold text-white mb-2", className)} {...props}>
      {children}
    </h3>
  );
}

export function ModernCardContent({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-white/80", className)} {...props}>
      {children}
    </div>
  );
}

export function ModernCardFooter({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mt-6 pt-4 border-t border-white/10", className)} {...props}>
      {children}
    </div>
  );
}
