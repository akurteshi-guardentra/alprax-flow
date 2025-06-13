
import { motion } from 'framer-motion';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';

interface PaymentSelectionStepProps {
  amount: string;
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
  onPaymentComplete: () => void;
}

export function PaymentSelectionStep({ 
  amount, 
  selectedMethod, 
  onMethodSelect, 
  onPaymentComplete 
}: PaymentSelectionStepProps) {
  return (
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
        onSelect={onMethodSelect}
        selected={selectedMethod}
        amount={parseFloat(amount) * 100} // Convert to cents
        onPaymentComplete={onPaymentComplete}
      />
    </motion.div>
  );
}
