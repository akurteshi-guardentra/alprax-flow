import { useState } from 'react';
import { getTestCards } from '@/services/paymentService';
import { Button } from '@/components/ui/button';
import { Copy, Check, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface TestCardsProps {
  onSelectCard?: (cardNumber: string) => void;
}

export function TestCards({ onSelectCard }: TestCardsProps) {
  const testCards = getTestCards();
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  const handleCopyCard = (cardNumber: string) => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    setCopiedCard(cardNumber);
    toast.success('Card number copied to clipboard');
    
    setTimeout(() => {
      setCopiedCard(null);
    }, 2000);
  };

  const handleSelectCard = (cardNumber: string) => {
    if (onSelectCard) {
      onSelectCard(cardNumber);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard className="h-4 w-4 text-white/70" />
        <h3 className="text-sm font-medium text-white">Test Cards</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {testCards.map((card) => (
          <motion.div
            key={card.number}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800/80 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-white">{card.name}</p>
                <p className="text-xs font-mono text-white/70">{card.number}</p>
              </div>
              <div className="flex gap-1">
                {onSelectCard && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    onClick={() => handleSelectCard(card.number)}
                  >
                    Use
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 bg-white/5 border-white/10 hover:bg-white/10 text-white"
                  onClick={() => handleCopyCard(card.number)}
                >
                  {copiedCard === card.number ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-4 mt-1">
              <p className="text-xs text-white/50">
                <span className="text-white/30">Exp:</span> {card.expiry}
              </p>
              <p className="text-xs text-white/50">
                <span className="text-white/30">CVC:</span> {card.cvc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <p className="text-xs text-white/50 text-center mt-2">
        These are Stripe test cards. No real charges will be made.
      </p>
    </div>
  );
}
