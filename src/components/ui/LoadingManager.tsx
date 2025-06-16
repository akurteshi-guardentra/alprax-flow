
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key: string) => loadingStates[key] || false;
  
  const isAnyLoading = () => Object.values(loadingStates).some(Boolean);

  return (
    <LoadingContext.Provider value={{ loadingStates, setLoading, isLoading, isAnyLoading }}>
      {children}
      <GlobalLoadingOverlay />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Enhanced loading spinner component
export function LoadingSpinner({ 
  size = "default", 
  className = "",
  text = "Loading..." 
}: { 
  size?: "sm" | "default" | "lg";
  className?: string;
  text?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-white/70">{text}</span>}
    </div>
  );
}

// Global loading overlay for critical operations
function GlobalLoadingOverlay() {
  const { loadingStates } = useLoading();
  
  const criticalOperations = ['payment', 'auth', 'stellar-transaction'];
  const hasCriticalLoading = criticalOperations.some(op => loadingStates[op]);

  return (
    <AnimatePresence>
      {hasCriticalLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center border border-white/20"
          >
            <LoadingSpinner size="lg" text="Processing..." className="text-white" />
            <p className="text-white/80 mt-4 text-sm">
              Please don't close this window
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing specific loading states
export function useLoadingState(key: string) {
  const { setLoading, isLoading } = useLoading();
  
  return {
    isLoading: isLoading(key),
    setLoading: (loading: boolean) => setLoading(key, loading),
    withLoading: async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
      setLoading(key, true);
      try {
        return await asyncFn();
      } finally {
        setLoading(key, false);
      }
    }
  };
}
