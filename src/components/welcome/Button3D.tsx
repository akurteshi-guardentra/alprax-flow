
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/haptics';

interface Button3DProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
}

export function Button3D({
  children,
  onClick,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  disabled = false,
  loading = false,
}: Button3DProps) {
  // Enhanced variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/30',
    secondary: 'bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 text-white shadow-lg shadow-black/10',
    outline: 'bg-transparent border border-white/20 hover:bg-white/5 text-white',
  };
  
  // Enhanced size styles
  const sizeStyles = {
    sm: 'text-xs py-2 px-3',
    md: 'text-sm py-2.5 px-5',
    lg: 'text-base py-3 px-6',
  };
  
  // Enhanced hover animation variants
  const buttonVariants = {
    initial: { y: 0 },
    hover: { y: -2 },
    tap: { y: 1 },
    disabled: { opacity: 0.6 }
  };
  
  const handleClick = () => {
    if (disabled || loading) return;
    
    // Add haptic feedback when clicked
    hapticFeedback('medium');
    
    if (onClick) onClick();
  };
  
  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        'relative rounded-xl font-medium transition-all duration-200 ease-out flex items-center justify-center gap-2',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      initial="initial"
      whileHover={!disabled ? "hover" : "disabled"}
      whileTap={!disabled ? "tap" : "disabled"}
      variants={buttonVariants}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {/* Enhanced button shine effect */}
      <span className="absolute inset-0 overflow-hidden rounded-xl opacity-70">
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
      </span>
      
      {/* Loading spinner with improved animation */}
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {/* Icon and content with improved spacing */}
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      
      {/* Enhanced 3D effect shadow */}
      <div className="absolute inset-0 rounded-xl bg-black/50 translate-y-[2px] -z-10 blur-[2px] scale-[0.98] opacity-50"></div>
    </motion.button>
  );
}
