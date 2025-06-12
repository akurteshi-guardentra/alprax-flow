
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Euro, DollarSign } from 'lucide-react';

interface AmountSelectionStepProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AmountSelectionStep({ amount, onAmountChange, onNext, onBack }: AmountSelectionStepProps) {
  const [localAmount, setLocalAmount] = useState(amount);
  const quickAmounts = [10, 25, 50, 100, 250, 500];
  const availableBalance = 1000;

  useEffect(() => {
    setLocalAmount(amount);
  }, [amount]);

  const handleAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanValue.split('.');
    if (parts.length > 2) return;
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;
    
    setLocalAmount(cleanValue);
    onAmountChange(cleanValue);
  };

  const handleQuickAmount = (value: number) => {
    const stringValue = value.toString();
    setLocalAmount(stringValue);
    onAmountChange(stringValue);
  };

  const handleMaxAmount = () => {
    const maxValue = availableBalance.toString();
    setLocalAmount(maxValue);
    onAmountChange(maxValue);
  };

  const isValidAmount = parseFloat(localAmount) > 0 && parseFloat(localAmount) <= availableBalance;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">How much would you like to send?</h2>
        <p className="text-white/70">Choose an amount or enter a custom value</p>
      </div>

      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={localAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-12 pr-20 h-16 text-2xl font-bold bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-white/70 font-medium">EUR</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-white/60 text-sm">Available Balance: €{availableBalance.toLocaleString()}</p>
              <Button 
                variant="link" 
                onClick={handleMaxAmount}
                className="text-blue-400 hover:text-blue-300 p-0 h-auto"
              >
                Use Max
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {quickAmounts.map((quickAmount) => (
          <Button
            key={quickAmount}
            variant="outline"
            onClick={() => handleQuickAmount(quickAmount)}
            className="h-12 border-white/20 text-white hover:bg-white/10"
          >
            €{quickAmount}
          </Button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 border-white/20 text-white hover:bg-white/10"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValidAmount}
          className="flex-1 bg-white text-blue-900 hover:bg-white/90"
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
