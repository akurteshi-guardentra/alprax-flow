
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, Wallet, Shield, Zap, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { AlpraxBrandHeader } from '@/components/brand/AlpraxLogo';
import { AbstractAccountService } from '@/services/account/AbstractAccountService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Alprax Flow',
      description: 'Experience the future of global payments. Send money anywhere, instantly.',
      icon: <Zap className="h-12 w-12 text-blue-400" />,
      action: null
    },
    {
      id: 'security',
      title: 'Bank-Level Security',
      description: 'Your funds are protected with military-grade encryption and secure protocols.',
      icon: <Shield className="h-12 w-12 text-green-400" />,
      action: null
    },
    {
      id: 'create-account',
      title: 'Create Your Wallet',
      description: 'We\'ll set up your secure digital wallet. This only takes a few seconds.',
      icon: <Wallet className="h-12 w-12 text-purple-400" />,
      action: 'createAccount'
    }
  ];

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    setAccountError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if account already exists
      const existingAccount = await AbstractAccountService.getAccount(user.id);
      
      if (existingAccount && existingAccount.accountId !== 'N/A') {
        // Account already exists
        setCreatedAccountId(existingAccount.accountId);
        setAccountCreated(true);
        toast.success('Wallet ready!');
      } else {
        // Create new account
        const account = await AbstractAccountService.createAccount(user.id);
        setCreatedAccountId(account.accountId);
        setAccountCreated(true);
        toast.success('Wallet created successfully!');
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
      setAccountError(error.message || 'Failed to create wallet. Please try again.');
      toast.error('Failed to create wallet');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleNext = async () => {
    const currentStepData = steps[currentStep];
    
    // If this step requires account creation and it hasn't been done yet
    if (currentStepData.action === 'createAccount' && !accountCreated) {
      await handleCreateAccount();
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const isAccountStep = currentStepData.action === 'createAccount';

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
                  {isCreatingAccount ? (
                    <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
                  ) : accountCreated && isAccountStep ? (
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  ) : (
                    currentStepData.icon
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                  {accountCreated && isAccountStep ? 'Wallet Created!' : currentStepData.title}
                </h2>
                
                <p className="text-white/80 mb-6 leading-relaxed text-center">
                  {accountCreated && isAccountStep ? (
                    <>Your secure wallet is ready. Account ID: <span className="font-mono text-blue-300">{createdAccountId}</span></>
                  ) : isCreatingAccount ? (
                    'Setting up your wallet and funding it with test funds...'
                  ) : (
                    currentStepData.description
                  )}
                </p>

                {/* Error display */}
                {accountError && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-200">{accountError}</p>
                  </div>
                )}

                {/* Success info for account creation */}
                {accountCreated && isAccountStep && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-200">
                      ✓ Your wallet has been funded with test funds. You're ready to start!
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                      disabled={isCreatingAccount}
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    disabled={isCreatingAccount}
                    className={`${currentStep > 0 ? 'flex-1' : 'w-full'} bg-primary hover:bg-primary-light text-white py-3 text-lg flex items-center justify-center`}
                  >
                    {isCreatingAccount ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Wallet...
                      </>
                    ) : isAccountStep && !accountCreated ? (
                      <>
                        Create Wallet
                        <Wallet className="ml-2 h-5 w-5" />
                      </>
                    ) : currentStep < steps.length - 1 ? (
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
                </div>

                {/* Retry button for errors */}
                {accountError && (
                  <Button
                    onClick={handleCreateAccount}
                    variant="outline"
                    className="w-full mt-3 border-white/20 text-white hover:bg-white/10"
                  >
                    Try Again
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Skip option for testing */}
        <div className="mt-4 text-center">
          <button
            onClick={onComplete}
            className="text-white/50 hover:text-white/70 text-sm underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
