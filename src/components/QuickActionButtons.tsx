
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Send, ArrowDownLeft } from 'lucide-react';
import { UnifiedPaymentHub } from './UnifiedPaymentHub';

export function QuickActionButtons() {
  const [showPaymentHub, setShowPaymentHub] = useState(false);
  const [defaultAction, setDefaultAction] = useState<'send' | 'request' | 'fund'>('send');

  const openHub = (action: 'send' | 'request' | 'fund') => {
    setDefaultAction(action);
    setShowPaymentHub(true);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Button
          onClick={() => openHub('send')}
          className="h-20 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-500/30 text-white flex-col gap-2"
        >
          <Send className="w-6 h-6" />
          <span className="text-sm font-medium">Send</span>
        </Button>

        <Button
          onClick={() => openHub('request')}
          className="h-20 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-500/30 text-white flex-col gap-2"
        >
          <ArrowDownLeft className="w-6 h-6" />
          <span className="text-sm font-medium">Request</span>
        </Button>

        <Button
          onClick={() => openHub('fund')}
          className="h-20 bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-500/30 text-white flex-col gap-2"
        >
          <Plus className="w-6 h-6" />
          <span className="text-sm font-medium">Add Funds</span>
        </Button>
      </div>

      <UnifiedPaymentHub 
        open={showPaymentHub}
        onOpenChange={setShowPaymentHub}
        defaultAction={defaultAction}
      />
    </>
  );
}
