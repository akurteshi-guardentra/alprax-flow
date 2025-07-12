import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

interface ProductionLoadingProps {
  message?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'minimal' | 'detailed' | 'splash';
}

export const ProductionLoading = ({ 
  message = 'Loading...', 
  showProgress = false,
  size = 'md',
  variant = 'minimal'
}: ProductionLoadingProps) => {
  const [progress, setProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState(0);

  useEffect(() => {
    if (!showProgress) return;

    const steps = [
      'Initializing application...',
      'Loading user preferences...',
      'Connecting to services...',
      'Preparing interface...',
      'Almost ready...'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress((currentStep + 1) * 20);
        setLoadingSteps(currentStep);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [showProgress]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center gap-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    );
  }

  if (variant === 'splash') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Zap className="w-10 h-10 text-primary" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Alprax Flow</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>

          {showProgress && (
            <div className="w-80 space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress}% complete
              </p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Detailed variant
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Card className="w-full max-w-md">
        <CardContent className={containerClasses[size]}>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className={`${sizeClasses[size]} text-primary`} />
              </motion.div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-foreground">{message}</h3>
              
              {showProgress && (
                <div className="space-y-3">
                  <Progress value={progress} className="h-2" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {progress}% complete
                    </p>
                    {loadingSteps < 5 && (
                      <motion.p
                        key={loadingSteps}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-muted-foreground"
                      >
                        {[
                          'Initializing application...',
                          'Loading user preferences...',
                          'Connecting to services...',
                          'Preparing interface...',
                          'Almost ready...'
                        ][loadingSteps]}
                      </motion.p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};