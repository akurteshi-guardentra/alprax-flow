
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { FiatDisplay } from '@/components/currency/FiatDisplay';
import { useStellarAccount } from '@/hooks/useStellarAccount';

interface SimpleFundingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'amount' | 'method' | 'processing' | 'success';

export function SimpleFundingModal({ open, onOpenChange }: SimpleFundingModalProps) {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const { balance } = useStellarAccount();

  const accountBalance = balance && balance.length > 0 ? balance[0].balance : "0";
  const quickAmounts = [25, 50, 100, 500];

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleNextStep = () => {
    if (step === 'amount' && amount) {
      setStep('method');
    } else if (step === 'method') {
      setStep('processing');
      // Simulate payment processing
      setTimeout(() => {
        setStep('success');
        toast.success('Funds added successfully!');
      }, 2000);
    }
  };

  const handleClose = () => {
    setStep('amount');
    setAmount('');
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
                onClick={() => setStep(step === 'method' ? 'amount' : 'amount')}
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

              <div className="space-y-3">
                <div
                  onClick={() => setSelectedMethod('card')}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedMethod === 'card'
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-white/70" />
                    <div>
                      <p className="text-white font-medium">Credit Card</p>
                      <p className="text-white/60 text-sm">Instant • 2.9% + $0.30</p>
                    </div>
                    {selectedMethod === 'card' && (
                      <Check className="w-5 h-5 text-blue-400 ml-auto" />
                    )}
                  </div>
                </div>

                <details className="text-white/60">
                  <summary className="text-sm cursor-pointer hover:text-white/80">
                    More payment options
                  </summary>
                  <div className="mt-2 text-xs space-y-1">
                    <p>• Bank Transfer - $0.25 fee, 1-3 days</p>
                    <p>• Mobile Money - 1.5% fee, 30 minutes</p>
                    <p>• Crypto Wallet - Network fees only</p>
                  </div>
                </details>
              </div>

              <Button
                onClick={handleNextStep}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-12"
              >
                Add ${amount}
              </Button>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-medium">Processing payment...</p>
              <p className="text-white/60 text-sm">This may take a few seconds</p>
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
