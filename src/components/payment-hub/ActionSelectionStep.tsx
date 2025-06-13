
import { Button } from '@/components/ui/button';
import { Plus, Send, ArrowDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { FiatDisplay } from '@/components/currency/FiatDisplay';

interface ActionSelectionStepProps {
  accountBalance: string;
  onActionSelect: (action: 'send' | 'request' | 'fund') => void;
}

export function ActionSelectionStep({ accountBalance, onActionSelect }: ActionSelectionStepProps) {
  return (
    <motion.div
      key="action"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <p className="text-white/70 text-sm mb-2">Current Balance</p>
        <div className="text-2xl font-bold text-white">
          <FiatDisplay xlmAmount={accountBalance} currency="USD" />
        </div>
      </div>

      <div className="grid gap-3">
        <Button
          onClick={() => onActionSelect('send')}
          className="h-16 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-white"
        >
          <Send className="w-6 h-6 mr-3" />
          <div className="text-left">
            <div className="font-semibold">Send Money</div>
            <div className="text-sm opacity-70">Send to friends & family</div>
          </div>
        </Button>

        <Button
          onClick={() => onActionSelect('request')}
          className="h-16 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-white"
        >
          <ArrowDownLeft className="w-6 h-6 mr-3" />
          <div className="text-left">
            <div className="font-semibold">Request Money</div>
            <div className="text-sm opacity-70">Request from others</div>
          </div>
        </Button>

        <Button
          onClick={() => onActionSelect('fund')}
          className="h-16 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white"
        >
          <Plus className="w-6 h-6 mr-3" />
          <div className="text-left">
            <div className="font-semibold">Add Funds</div>
            <div className="text-sm opacity-70">Top up your account</div>
          </div>
        </Button>
      </div>
    </motion.div>
  );
}
