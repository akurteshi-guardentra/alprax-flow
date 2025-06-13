
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useStellarAccount } from '@/hooks/useStellarAccount';
import { AmountInputStep } from './steps/AmountInputStep';
import { PaymentSelectionStep } from './steps/PaymentSelectionStep';
import { FundingSuccessStep } from './steps/FundingSuccessStep';

interface SimpleFundingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'amount' | 'method' | 'success';

export function SimpleFundingModal({ open, onOpenChange }: SimpleFundingModalProps) {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const { balance, refreshBalance } = useStellarAccount();

  const accountBalance = balance && balance.length > 0 ? balance[0].balance : "0";

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleNextStep = () => {
    if (step === 'amount' && amount) {
      setStep('method');
    }
  };

  const handlePaymentComplete = async () => {
    setStep('success');
    toast.success('Funds added successfully!');
    // Refresh the balance after successful payment
    await refreshBalance();
  };

  const handleClose = () => {
    setStep('amount');
    setAmount('');
    setSelectedMethod('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {step !== 'amount' && step !== 'success' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep('amount')}
                className="h-6 w-6 text-white/70 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            Add Funds
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <AmountInputStep
              accountBalance={accountBalance}
              amount={amount}
              onAmountChange={setAmount}
              onAmountSelect={handleAmountSelect}
              onContinue={handleNextStep}
            />
          )}

          {step === 'method' && (
            <PaymentSelectionStep
              amount={amount}
              selectedMethod={selectedMethod}
              onMethodSelect={setSelectedMethod}
              onPaymentComplete={handlePaymentComplete}
            />
          )}

          {step === 'success' && (
            <FundingSuccessStep
              amount={amount}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
