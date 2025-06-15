
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, Wallet, Shield, Zap } from 'lucide-react';
import { AlpraxBrandHeader } from '@/components/brand/AlpraxLogo';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
  completed?: boolean;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Alprax Flow',
      description: 'Experience the future of global payments with blockchain technology.',
      icon: <Zap className="h-12 w-12 text-blue-400" />
    },
    {
      id: 'security',
      title: 'Bank-Level Security',
      description: 'Your funds are protected with military-grade encryption and multi-signature protocols.',
      icon: <Shield className="h-12 w-12 text-green-400" />
    },
    {
      id: 'wallet',
      title: 'Your Digital Wallet',
      description: 'Send money to 180+ countries instantly with competitive exchange rates.',
      icon: <Wallet className="h-12 w-12 text-purple-400" />
    }
  ];

  const handleNext = () => {
    const currentStepId = steps[currentStep].id;
    setCompletedSteps(prev => new Set([...prev, currentStepId]));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen modern-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <AlpraxBrandHeader size="lg" className="mb-6" />
          <Progress value={progress} className="w-full h-2 bg-white/10" />
          <p className="text-white/70 text-sm mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card modern-shadow">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  {steps[currentStep].icon}
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                  {steps[currentStep].title}
                </h2>
                
                <p className="text-white/80 mb-8 leading-relaxed text-center">
                  {steps[currentStep].description}
                </p>

                <Button
                  onClick={handleNext}
                  className="w-full bg-primary hover:bg-primary-light text-white py-3 text-lg flex items-center justify-center"
                >
                  {currentStep < steps.length - 1 ? (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Get Started
                      <CheckCircle className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
