import { memo } from "react";
import { motion } from "framer-motion";
import { Zap, Star, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaymentSuggestion {
  id: string;
  type: 'quick' | 'recent' | 'popular' | 'smart';
  amount: string;
  currency: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
}

interface PaymentSuggestionsProps {
  onSelectAmount: (amount: string) => void;
  currency?: string;
  className?: string;
}

const suggestions: PaymentSuggestion[] = [
  {
    id: 'quick-50',
    type: 'quick',
    amount: '50',
    currency: 'EUR',
    label: '€50',
    description: 'Quick amount',
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'quick-100',
    type: 'quick',
    amount: '100',
    currency: 'EUR',
    label: '€100',
    description: 'Quick amount',
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'recent-75',
    type: 'recent',
    amount: '75',
    currency: 'EUR',
    label: '€75',
    description: 'Last sent',
    icon: <Clock className="w-4 h-4" />
  },
  {
    id: 'popular-200',
    type: 'popular',
    amount: '200',
    currency: 'EUR',
    label: '€200',
    description: 'Popular amount',
    icon: <Star className="w-4 h-4" />
  },
  {
    id: 'smart-125',
    type: 'smart',
    amount: '125',
    currency: 'EUR',
    label: '€125',
    description: 'Smart suggestion',
    icon: <TrendingUp className="w-4 h-4" />
  },
];

const typeStyles = {
  quick: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:from-yellow-500/30 hover:to-orange-500/30",
  recent: "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/30",
  popular: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30",
  smart: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30"
};

export const PaymentSuggestions = memo(function PaymentSuggestions({
  onSelectAmount,
  currency = 'EUR',
  className
}: PaymentSuggestionsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-medium text-white">Quick Amounts</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              onClick={() => onSelectAmount(suggestion.amount)}
              className={cn(
                "h-auto p-4 flex flex-col items-center gap-2 text-center border transition-all duration-300",
                typeStyles[suggestion.type]
              )}
            >
              <div className="flex items-center gap-2">
                {suggestion.icon}
                <span className="font-semibold text-white">{suggestion.label}</span>
              </div>
              <span className="text-xs text-white/60">{suggestion.description}</span>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Custom Amount Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <Button
          variant="outline"
          onClick={() => onSelectAmount('')}
          className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
        >
          Enter Custom Amount
        </Button>
      </motion.div>
    </div>
  );
});