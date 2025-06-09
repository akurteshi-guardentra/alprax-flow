import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySymbol } from "@/components/CurrencyDisplay";

interface AmountFieldProps {
  amount: string; // This is fiatAmount
  setAmount: (value: string) => void; // This is setFiatAmount
  availableFunds: number; // This is availableFiatFunds
  defaultFiat: string; // Added defaultFiat
  className?: string;
}

export function AmountField({ amount, setAmount, availableFunds, defaultFiat, className }: AmountFieldProps) {
  // Remove useTransactionSubmission() here as props are now passed down
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-white">Amount ({defaultFiat})</Label>
      <div className="relative">
        <CurrencySymbol currency={defaultFiat} className="absolute left-3 top-3 h-4 w-4 text-white/60" />
        <Input
          type="number"
          min="0.01"
          step="0.01"
          placeholder={`Enter amount in ${defaultFiat}`}
          value={amount} // Use the passed fiat amount
          onChange={(e) => setAmount(e.target.value)} // Use the passed setFiatAmount
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 h-10 sm:h-12"
        />
      </div>
      <div className="flex justify-between text-xs sm:text-sm text-white/60">
        <span>Transfer Fee: {amount ? (parseFloat(amount) * 0.001).toFixed(2) : '0.00'} {defaultFiat}</span>
        {/* Display available funds in fiat */}
        <span>Available: <CurrencySymbol currency={defaultFiat} className="inline h-3.5 w-3.5" />{availableFunds.toFixed(2)}</span>
      </div>
    </div>
  );
}
