
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DollarSign, Wallet, Zap } from "lucide-react";

interface AmountSelectionStepProps {
  amount: string;
  setAmount: (amount: string) => void;
  availableFunds: number;
  defaultFiat: string;
  fiatRate: number;
}

export function AmountSelectionStep({
  amount,
  setAmount,
  availableFunds,
  defaultFiat,
  fiatRate
}: AmountSelectionStepProps) {
  const maxFiatAmount = fiatRate > 0 ? availableFunds * fiatRate : availableFunds;

  const quickAmounts = [10, 25, 50, 100];

  const formatAmount = (value: number) => {
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  };

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleanValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Available Balance */}
      <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wallet className="h-4 w-4 text-white/60" />
          <span className="text-white/70 text-sm">Available Balance</span>
        </div>
        <div className="text-xl font-semibold text-white">
          {fiatRate > 0 
            ? `${formatAmount(maxFiatAmount)} ${defaultFiat}`
            : `-- ${defaultFiat}`
          }
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <Label className="text-white flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Amount ({defaultFiat})
        </Label>
        <div className="relative">
          <Input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            className="bg-white/10 border-white/20 text-white text-lg pr-16 h-12"
          />
          <div className="absolute right-3 top-0 bottom-0 flex items-center">
            <span className="text-white/60 font-medium">{defaultFiat}</span>
          </div>
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="space-y-2">
        <Label className="text-white text-sm">Quick amounts</Label>
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="outline"
              onClick={() => setAmount(quickAmount.toString())}
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm"
              disabled={quickAmount > maxFiatAmount}
            >
              {quickAmount}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={() => setAmount(Math.floor(maxFiatAmount).toString())}
          className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-sm"
          disabled={maxFiatAmount <= 0}
        >
          Use maximum amount
        </Button>
      </div>

      {/* Stellar Network Benefits */}
      <div className="text-center p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-medium">Stellar Network Benefits</span>
        </div>
        <p className="text-blue-200 text-xs">
          FREE instant transfers • Secured by blockchain technology
        </p>
        <p className="text-green-300 text-xs mt-1 font-medium">
          ✨ Network fee: FREE on Stellar Testnet
        </p>
      </div>
    </motion.div>
  );
}
