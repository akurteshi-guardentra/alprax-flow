
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

interface AmountSelectionStepProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  onAmountSelect: (amount: number) => void;
  onContinue: () => void;
}

export function AmountSelectionStep({ 
  amount, 
  onAmountChange, 
  onAmountSelect, 
  onContinue 
}: AmountSelectionStepProps) {
  const quickAmounts = [25, 50, 100, 500];

  return (
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
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-12"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
