import { useStellarAccount } from "@/hooks/useStellarAccount";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, RefreshCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useState, useEffect } from "react";
import { hapticFeedback } from "@/lib/haptics";
import { motion } from "framer-motion";
import { CurrencySymbol } from "@/components/CurrencyDisplay"; // Import CurrencySymbol
import { useTransactionSubmission } from "@/hooks/useTransactionSubmission"; // Import for fiat rate

export function AccountBalance() {
  const { balance, fundAccount, isFunding } = useStellarAccount();
  const { fiatRate, defaultFiat } = useTransactionSubmission(); // Get fiat rate and default currency
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Effect to show success animation after funding
  useEffect(() => {
    if (!isFunding && showSuccess) {
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [isFunding, showSuccess]);

  const handleFundAccount = async () => {
    hapticFeedback("medium");
    await fundAccount();
    setShowSuccess(true);
  };

  return (
    <div className="space-y-2 relative">
      {/* Success animation overlay */}
      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-green-500/20 z-10 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            className="bg-green-500/30 backdrop-blur-sm p-6 rounded-xl border border-green-400/30 flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1, damping: 10, stiffness: 300 }}
            >
              <Check className="h-12 w-12 text-green-400 mb-2" />
            </motion.div>
            <h3 className="text-green-300 text-xl font-bold">Funds Added!</h3>
            <p className="text-green-200 text-sm mt-1">
              Test funds have been added successfully
            </p>
          </motion.div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-white/60">Available Funds</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-white/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white border-white/20">
              <p>This is your available balance for transfers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {balance && balance.length > 0 ? (
        balance.map((b, index) => {
          const fiatBalance = (parseFloat(b.balance) * fiatRate).toFixed(2);
          return (
            <div key={index} className="flex justify-between items-center bg-white/10 p-4 rounded">
              <div className="flex items-center gap-2">
                <CurrencySymbol currency={defaultFiat} className="h-5 w-5 text-white" />
                <span className="text-white text-lg">{defaultFiat}</span>
              </div>
              <span className="text-white text-lg font-mono">{fiatBalance}</span>
            </div>
          );
        })
      ) : (
        <div className="flex justify-between items-center bg-white/10 p-4 rounded">
          <div className="flex items-center gap-2">
            <CurrencySymbol currency={defaultFiat} className="h-5 w-5 text-white" />
            <span className="text-white text-lg">{defaultFiat}</span>
          </div>
          <span className="text-white text-lg font-mono">0.00</span>
        </div>
      )}
      
      <div className="mt-4">
        <Button
          onClick={handleFundAccount}
          disabled={isFunding || fiatRate === 0} // Disable if rate not fetched
          variant="outline"
          className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 border border-green-500/30"
        >          {isFunding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Funds...
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Add Test Funds ({defaultFiat})
            </>
          )}
        </Button>
        <p className="text-xs text-white/40 text-center mt-2">
          This adds test funds to your account. Fast, low-cost transfers powered by blockchain technology.
        </p>
      </div>
    </div>
  );
}

// Fix missing Check icon import
import { Check } from "lucide-react";
