
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Send, ArrowDownLeft, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { FiatDisplay } from '@/components/currency/FiatDisplay';
import { useStellarAccount } from '@/hooks/useStellarAccount';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';

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
  const quickAmounts = [25, 50, 100, 500];

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
            <motion.div
              key="action"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <p className="text-white/70 text-sm mb-2">Current Balance</p>
                <div className="text-2xl font-bold text-white">
                  <FiatDisplay xlmAmount={accountBalance} currency="USD" />
                </div>
              </div>

              <div className="grid gap-3">
                <Button
                  onClick={() => handleActionSelect('send')}
                  className="h-16 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-white"
                >
                  <Send className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Send Money</div>
                    <div className="text-sm opacity-70">Send to friends & family</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleActionSelect('request')}
                  className="h-16 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-white"
                >
                  <ArrowDownLeft className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Request Money</div>
                    <div className="text-sm opacity-70">Request from others</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleActionSelect('fund')}
                  className="h-16 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Add Funds</div>
                    <div className="text-sm opacity-70">Top up your account</div>
                  </div>
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
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
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-12"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'recipient' && (
            <motion.div
              key="recipient"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-white/70 text-sm">{action === 'send' ? 'Sending' : 'Requesting'}</p>
                <div className="text-2xl font-bold text-white">${amount}</div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/90">
                    {action === 'send' ? 'Send to' : 'Request from'}
                  </Label>
                  <Input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Email, phone, or username"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <Button
                  onClick={handleNextStep}
                  disabled={!recipient}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-12"
                >
                  {action === 'send' ? 'Send' : 'Request'} ${amount}
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

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-medium">Processing...</p>
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
              <h3 className="text-white font-bold text-lg mb-2">
                {action === 'fund' ? 'Funds Added!' : action === 'send' ? 'Money Sent!' : 'Request Sent!'}
              </h3>
              <p className="text-white/70 mb-6">
                {action === 'fund' 
                  ? `$${amount} has been added to your account`
                  : `$${amount} ${action === 'send' ? 'sent to' : 'requested from'} ${recipient}`
                }
              </p>
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
