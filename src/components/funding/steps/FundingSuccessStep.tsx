
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface FundingSuccessStepProps {
  amount: string;
  onClose: () => void;
}

export function FundingSuccessStep({ amount, onClose }: FundingSuccessStepProps) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-green-400" />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">Funds Added!</h3>
      <p className="text-white/70 mb-6">${amount} has been added to your account</p>
      <Button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
      >
        Done
      </Button>
    </motion.div>
  );
}
