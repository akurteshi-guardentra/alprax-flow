
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useStellarAccount } from '@/hooks/useStellarAccount';
import { ActionSelectionStep } from './payment-hub/ActionSelectionStep';
import { AmountSelectionStep } from './payment-hub/AmountSelectionStep';
import { RecipientSelectionStep } from './payment-hub/RecipientSelectionStep';
import { PaymentMethodStep } from './payment-hub/PaymentMethodStep';
import { ProcessingStep } from './payment-hub/ProcessingStep';
import { SuccessStep } from './payment-hub/SuccessStep';

interface UnifiedPaymentHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAction?: 'send' | 'request' | 'fund';
}

type Step = 'action' | 'amount' | 'recipient' | 'method' | 'processing' | 'success';
type Action = 'send' | 'request' | 'fund';

export function UnifiedPaymentHub({ open, onOpenChange, defaultAction = 'send' }: UnifiedPaymentHubProps) {
  const [step, setStep] = useState<Step>('action');
  const [action, setAction] = useState<Action>(defaultAction);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const { balance } = useStellarAccount();

  const accountBalance = balance && balance.length > 0 ? balance[0].balance : "0";

  const handleActionSelect = (selectedAction: Action) => {
    setAction(selectedAction);
    setStep('amount');
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleNextStep = () => {
    if (step === 'action') {
      setStep('amount');
    } else if (step === 'amount' && amount) {
      if (action === 'fund') {
        setStep('method');
      } else {
        setStep('recipient');
      }
    } else if (step === 'recipient' && recipient) {
      setStep('processing');
      simulateTransaction();
    }
  };

  const simulateTransaction = () => {
    setTimeout(() => {
      setStep('success');
      toast.success(`${action === 'fund' ? 'Funds added' : 'Payment sent'} successfully!`);
    }, 2000);
  };

  const handlePaymentComplete = () => {
    setStep('success');
    toast.success('Funds added successfully!');
  };

  const handleClose = () => {
    setStep('action');
    setAmount('');
    setRecipient('');
    setSelectedMethod('');
    onOpenChange(false);
  };

  const getActionTitle = () => {
    switch (action) {
      case 'send': return 'Send Money';
      case 'request': return 'Request Money';
      case 'fund': return 'Add Funds';
      default: return 'Payment';
    }
  };

  const getBackStep = () => {
    switch (step) {
      case 'amount': return 'action';
      case 'recipient': return 'amount';
      case 'method': return 'amount';
      default: return 'action';
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
                onClick={() => setStep(getBackStep() as Step)}
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
              accountBalance={accountBalance}
              onActionSelect={handleActionSelect}
            />
          )}

          {step === 'amount' && (
            <AmountSelectionStep
              amount={amount}
              onAmountChange={setAmount}
              onAmountSelect={handleAmountSelect}
              onContinue={handleNextStep}
            />
          )}

          {step === 'recipient' && (
            <RecipientSelectionStep
              action={action as 'send' | 'request'}
              amount={amount}
              recipient={recipient}
              onRecipientChange={setRecipient}
              onContinue={handleNextStep}
            />
          )}

          {step === 'method' && (
            <PaymentMethodStep
              amount={amount}
              selectedMethod={selectedMethod}
              onMethodSelect={setSelectedMethod}
              onPaymentComplete={handlePaymentComplete}
            />
          )}

          {step === 'processing' && <ProcessingStep />}

          {step === 'success' && (
            <SuccessStep
              action={action}
              amount={amount}
              recipient={recipient}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
