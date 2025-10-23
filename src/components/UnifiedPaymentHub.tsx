
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AbstractAccountService } from '@/services/account/AbstractAccountService';
import { AbstractPaymentService } from '@/services/payment/AbstractPaymentService';
import { ActionSelectionStep } from './payment-hub/ActionSelectionStep';
import { AmountSelectionStep } from './payment-hub/AmountSelectionStep';
import { RecipientSelectionStep } from './payment-hub/RecipientSelectionStep';
import { PaymentMethodStep } from './payment-hub/PaymentMethodStep';
import { ProcessingStep } from './payment-hub/ProcessingStep';
import { SuccessStep } from './payment-hub/SuccessStep';
import { BackButton } from '@/components/ui/back-button';

interface UnifiedPaymentHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAction?: 'send' | 'request' | 'fund';
}

type Step = 'action' | 'amount' | 'recipient' | 'method' | 'processing' | 'success';
type Action = 'send' | 'request' | 'fund';

export function UnifiedPaymentHub({ open, onOpenChange, defaultAction = 'send' }: UnifiedPaymentHubProps) {
  const [step, setStep] = useState<Step>('action');
  const [wizardData, setWizardData] = useState<Record<string, any>>({
    action: defaultAction
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [userAccount, setUserAccount] = useState<any>(null);

  // Load user account on mount
  useEffect(() => {
    AbstractAccountService.getAccount().then(setUserAccount);
  }, []);

  const accountBalance = userAccount?.balance?.toString() || "0";

  const handleNext = (stepData?: any) => {
    if (stepData) {
      setWizardData(prev => ({ ...prev, ...stepData }));
    }
    
    switch (step) {
      case 'action':
        setStep('amount');
        break;
      case 'amount':
        if (wizardData.action === 'fund') {
          setStep('method');
        } else {
          setStep('recipient');
        }
        break;
      case 'recipient':
        setStep('processing');
        simulateTransaction();
        break;
      case 'method':
        setStep('success');
        toast.success('Funds added successfully!');
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'amount':
        setStep('action');
        break;
      case 'recipient':
        setStep('amount');
        break;
      case 'method':
        setStep('amount');
        break;
      default:
        break;
    }
  };

  const simulateTransaction = async () => {
    setIsProcessing(true);
    try {
      // Use AbstractPaymentService for actual payment
      const result = await AbstractPaymentService.sendPayment({
        recipientId: wizardData.recipient?.id,
        amount: parseFloat(wizardData.amount),
        currency: userAccount?.currency || 'USD',
        memo: wizardData.description
      });

      if (result.success) {
        setWizardData(prev => ({ 
          ...prev, 
          confirmationId: result.confirmationId,
          timestamp: result.timestamp 
        }));
        setStep('success');
        toast.success('Payment sent successfully!');
      } else {
        toast.error(result.error || 'Payment failed');
        setStep('amount');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
      setStep('amount');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('action');
    setWizardData({ action: defaultAction });
    setIsProcessing(false);
    onOpenChange(false);
  };

  const getActionTitle = () => {
    switch (wizardData.action) {
      case 'send': return 'Send Money';
      case 'request': return 'Request Money';
      case 'fund': return 'Add Funds';
      default: return 'Payment';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {step !== 'action' && step !== 'success' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-6 w-6 text-white/70 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {step === 'action' ? 'Choose Action' : getActionTitle()}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'action' && (
            <ActionSelectionStep 
              data={wizardData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 'amount' && (
            <AmountSelectionStep
              data={wizardData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 'recipient' && (
            <RecipientSelectionStep
              data={wizardData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 'method' && (
            <PaymentMethodStep
              data={wizardData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 'processing' && (
            <ProcessingStep 
              data={wizardData}
              onNext={handleNext}
              onBack={handleBack}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          )}

          {step === 'success' && (
            <SuccessStep
              data={wizardData}
              onComplete={handleClose}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
