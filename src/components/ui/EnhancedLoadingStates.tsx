// Enhanced loading states for better user experience
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  progress?: number;
}

interface LoadingIndicatorProps {
  state: LoadingState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingIndicator({ state, size = 'md', className }: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderIcon = () => {
    switch (state.status) {
      case 'loading':
        return <Loader2 className={cn('animate-spin text-blue-500', sizeClasses[size])} />;
      case 'success':
        return <CheckCircle className={cn('text-green-500', sizeClasses[size])} />;
      case 'error':
        return <AlertCircle className={cn('text-red-500', sizeClasses[size])} />;
      default:
        return <Clock className={cn('text-gray-500', sizeClasses[size])} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.status}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={cn('flex items-center gap-2', className)}
      >
        {renderIcon()}
        {state.message && (
          <span className={cn('text-white/80', textSizes[size])}>
            {state.message}
          </span>
        )}
        {state.progress !== undefined && (
          <div className="ml-2">
            <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${state.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Skeleton loading components
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg bg-white/10 animate-pulse', className)}>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/20 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-white/20 rounded"></div>
          <div className="h-3 bg-white/20 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
          <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/20 rounded w-1/2 animate-pulse"></div>
            <div className="h-3 bg-white/20 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="grid gap-4 p-3 bg-white/10 rounded-lg" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-white/30 rounded animate-pulse"></div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 p-3 bg-white/5 rounded-lg" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="h-3 bg-white/20 rounded animate-pulse"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading overlay for forms
interface FormLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  children: React.ReactNode;
}

export function FormLoadingOverlay({ isLoading, message, progress, children }: FormLoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center border border-white/20"
            >
              <LoadingIndicator
                state={{ status: 'loading', message, progress }}
                size="lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing loading states
export function useLoadingStates() {
  const [states, setStates] = React.useState<Record<string, LoadingState>>({});

  const setLoading = React.useCallback((key: string, state: Partial<LoadingState>) => {
    setStates(prev => ({
      ...prev,
      [key]: { status: 'idle', ...prev[key], ...state }
    }));
  }, []);

  const getState = React.useCallback((key: string): LoadingState => {
    return states[key] || { status: 'idle' };
  }, [states]);

  const isLoading = React.useCallback((key: string): boolean => {
    return states[key]?.status === 'loading';
  }, [states]);

  const isAnyLoading = React.useCallback((): boolean => {
    return Object.values(states).some(state => state.status === 'loading');
  }, [states]);

  return { setLoading, getState, isLoading, isAnyLoading };
}