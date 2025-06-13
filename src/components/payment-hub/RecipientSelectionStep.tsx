
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

interface RecipientSelectionStepProps {
  action: 'send' | 'request';
  amount: string;
  recipient: string;
  onRecipientChange: (recipient: string) => void;
  onContinue: () => void;
}

export function RecipientSelectionStep({ 
  action, 
  amount, 
  recipient, 
  onRecipientChange, 
  onContinue 
}: RecipientSelectionStepProps) {
  return (
    <motion.div
      key="recipient"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <p className="text-white/70 text-sm">{action === 'send' ? 'Sending' : 'Requesting'}</p>
        <div className="text-2xl font-bold text-white">${amount}</div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white/90">
            {action === 'send' ? 'Send to' : 'Request from'}
          </Label>
          <Input
            type="text"
            value={recipient}
            onChange={(e) => onRecipientChange(e.target.value)}
            placeholder="Email, phone, or username"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <Button
          onClick={onContinue}
          disabled={!recipient}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-12"
        >
          {action === 'send' ? 'Send' : 'Request'} ${amount}
        </Button>
      </div>
    </motion.div>
  );
}
