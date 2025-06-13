
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { FiatDisplay } from '@/components/currency/FiatDisplay';

interface AmountInputStepProps {
  accountBalance: string;
  amount: string;
  onAmountChange: (amount: string) => void;
  onAmountSelect: (amount: number) => void;
  onContinue: () => void;
}

export function AmountInputStep({ 
  accountBalance, 
  amount, 
  onAmountChange, 
  onAmountSelect, 
  onContinue 
}: AmountInputStepProps) {
  const quickAmounts = [25, 50, 100, 500];

  return (
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
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg h-12"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="outline"
              onClick={() => onAmountSelect(quickAmount)}
              className="bg-white/5 border-white/20 text-white hover:bg-white/20"
            >
              ${quickAmount}
            </Button>
          ))}
        </div>

        <Button
          onClick={onContinue}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-12"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
