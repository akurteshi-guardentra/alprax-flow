
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

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
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center space-y-6 py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
      >
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
      </motion.div>

      <div>
        <h3 className="text-xl font-bold text-white mb-2">Funds Added Successfully!</h3>
        <p className="text-white/70">
          ${amount} has been added to your account and converted to XLM
        </p>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <p className="text-green-300 text-sm">
          Your XLM balance has been updated and is ready for transfers
        </p>
      </div>

      <Button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
      >
        Continue
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}
