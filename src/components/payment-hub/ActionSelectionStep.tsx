import { memo } from "react";
import { motion } from "framer-motion";
import { Send, RefreshCw, QrCode, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActionSelectionStepProps {
  data: Record<string, any>;
  onNext: (data?: any) => void;
  onBack: () => void;
}

const actions = [
  {
    id: 'send',
    title: 'Send Money',
    description: 'Send money to a recipient',
    icon: Send,
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 'request',
    title: 'Request Money',
    description: 'Request payment from someone',
    icon: RefreshCw,
    color: 'from-green-500 to-blue-500'
  },
  {
    id: 'qr',
    title: 'QR Payment',
    description: 'Pay using QR code',
    icon: QrCode,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'card',
    title: 'Card Payment',
    description: 'Pay with card details',
    icon: CreditCard,
    color: 'from-orange-500 to-red-500'
  }
];

export const ActionSelectionStep = memo(function ActionSelectionStep({
  data,
  onNext
}: ActionSelectionStepProps) {
  const handleActionSelect = (actionId: string) => {
    onNext({ action: actionId });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">What would you like to do?</h3>
        <p className="text-white/70">Choose an action to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              onClick={() => handleActionSelect(action.id)}
              className={cn(
                "w-full h-auto p-6 flex flex-col items-center gap-4 text-center",
                "bg-gradient-to-br hover:scale-105 transition-all duration-300",
                "border border-white/20 hover:border-white/30",
                action.color
              )}
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">{action.title}</h4>
                <p className="text-sm text-white/80">{action.description}</p>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
});