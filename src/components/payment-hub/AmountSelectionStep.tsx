import { memo, useState } from "react";
import { motion } from "framer-motion";
import { PaymentSuggestions } from "./PaymentSuggestions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface AmountSelectionStepProps {
  data: Record<string, any>;
  onNext: (data?: any) => void;
  onBack: () => void;
}

export const AmountSelectionStep = memo(function AmountSelectionStep({
  data,
  onNext,
  onBack
}: AmountSelectionStepProps) {
  const [amount, setAmount] = useState(data.amount || '');
  const [description, setDescription] = useState(data.description || '');

  const handleAmountSelect = (selectedAmount: string) => {
    setAmount(selectedAmount);
  };

  const handleNext = () => {
    if (amount && parseFloat(amount) > 0) {
      onNext({ amount, description });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          {data.action === 'request' ? 'How much are you requesting?' : 'How much are you sending?'}
        </h3>
        <p className="text-white/70">Choose an amount or enter a custom value</p>
      </div>

      <PaymentSuggestions
        onSelectAmount={handleAmountSelect}
        currency="USD"
      />

      <div className="space-y-4">
        <div>
          <Label htmlFor="custom-amount" className="text-white">Custom Amount (USD)</Label>
          <Input
            id="custom-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className="bg-white/10 border-white/20 text-white text-lg h-12"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-white">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this payment for?"
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!amount || parseFloat(amount) <= 0}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
});