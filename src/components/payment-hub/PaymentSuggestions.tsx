import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PaymentSuggestionsProps {
  onSelectAmount: (amount: string) => void;
  currency?: string;
}

const suggestedAmounts = [
  { amount: 25, label: "$25" },
  { amount: 50, label: "$50" },
  { amount: 100, label: "$100" },
  { amount: 250, label: "$250" },
  { amount: 500, label: "$500" },
  { amount: 1000, label: "$1,000" }
];

export const PaymentSuggestions = memo(function PaymentSuggestions({
  onSelectAmount,
  currency = "USD"
}: PaymentSuggestionsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-white/90">Quick amounts</h4>
      <div className="grid grid-cols-3 gap-3">
        {suggestedAmounts.map((suggestion, index) => (
          <motion.div
            key={suggestion.amount}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant="outline"
              onClick={() => onSelectAmount(suggestion.amount.toString())}
              className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              {suggestion.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
});