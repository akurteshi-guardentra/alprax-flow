
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { FiatDisplay } from '@/components/currency/FiatDisplay';
import { useStellarAccount } from '@/hooks/useStellarAccount';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';

interface SimpleFundingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'amount' | 'method' | 'processing' | 'success';

export function SimpleFundingModal({ open, onOpenChange }: SimpleFundingModalProps) {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const { balance } = useStellarAccount();

  const accountBalance = balance && balance.length > 0 ? balance[0].balance : "0";
  const quickAmounts = [25, 50, 100, 500];

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleNextStep = () => {
    if (step === 'amount' && amount) {
      setStep('method');
    }
  };

  const handlePaymentComplete = () => {
    setStep('success');
    toast.success('Funds added successfully!');
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
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-white/70 text-sm mb-2">Current Balance</p>
                <div className="text-2xl font-bold text-white">
                  <FiatDisplay xlmAmount={accountBalance} currency="USD" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/90">Enter Amount (USD)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      onClick={() => handleAmountSelect(quickAmount)}
                      className="bg-white/5 border-white/20 text-white hover:bg-white/20"
                    >
                      ${quickAmount}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={handleNextStep}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-12"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'method' && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-white/70 text-sm">Adding</p>
                <div className="text-2xl font-bold text-white">${amount}</div>
              </div>

              <PaymentMethodSelector
                onSelect={setSelectedMethod}
                selected={selectedMethod}
                amount={parseFloat(amount) * 100} // Convert to cents
                onPaymentComplete={handlePaymentComplete}
              />
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Funds Added!</h3>
              <p className="text-white/70 mb-6">${amount} has been added to your account</p>
              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
