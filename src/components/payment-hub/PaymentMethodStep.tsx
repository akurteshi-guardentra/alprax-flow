import { memo, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Wallet, Smartphone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaymentMethodStepProps {
  data: Record<string, any>;
  onNext: (data?: any) => void;
  onBack: () => void;
}

const paymentMethods = [
  {
    id: 'stellar',
    title: 'Stellar Wallet',
    description: 'Fast and secure blockchain payment',
    icon: Wallet,
    fee: '0.00001 XLM',
    time: 'Instant',
    recommended: true
  },
  {
    id: 'card',
    title: 'Credit/Debit Card',
    description: 'Pay with your card',
    icon: CreditCard,
    fee: '2.9% + €0.30',
    time: '1-3 minutes'
  },
  {
    id: 'mobile',
    title: 'Mobile Payment',
    description: 'Use mobile wallet',
    icon: Smartphone,
    fee: '1.5%',
    time: 'Instant'
  }
];

export const PaymentMethodStep = memo(function PaymentMethodStep({
  data,
  onNext,
  onBack
}: PaymentMethodStepProps) {
  const [selectedMethod, setSelectedMethod] = useState(data.paymentMethod || 'stellar');

  const handleNext = () => {
    onNext({ paymentMethod: selectedMethod });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Choose payment method</h3>
        <p className="text-white/70">Select how you'd like to send the payment</p>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <motion.div
            key={method.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              onClick={() => setSelectedMethod(method.id)}
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-all duration-200 relative",
                selectedMethod === method.id
                  ? "bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/30"
                  : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30"
              )}
            >
              {method.recommended && (
                <div className="absolute -top-2 left-4">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Recommended
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  selectedMethod === method.id ? "bg-blue-500/30" : "bg-white/10"
                )}>
                  <method.icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{method.title}</h4>
                    {method.recommended && (
                      <Shield className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-sm text-white/70 mb-2">{method.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span>Fee: {method.fee}</span>
                    <span>•</span>
                    <span>Time: {method.time}</span>
                  </div>
                </div>

                <div className={cn(
                  "w-4 h-4 rounded-full border-2 transition-colors",
                  selectedMethod === method.id
                    ? "border-blue-500 bg-blue-500"
                    : "border-white/30"
                )}>
                  {selectedMethod === method.id && (
                    <div className="w-full h-full rounded-full bg-white/20" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
});