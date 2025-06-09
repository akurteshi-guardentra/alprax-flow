import { Info, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BlockchainInfoBannerProps {
  className?: string;
  fiatCurrency?: string;
}

export function BlockchainInfoBanner({ className, fiatCurrency = "EUR" }: BlockchainInfoBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-blue-900/20 border border-blue-500/20 rounded-lg overflow-hidden ${className}`}>
      <div 
        className="p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="bg-blue-500/30 p-1.5 rounded">
            <Zap className="h-4 w-4 text-blue-300" />
          </div>
          <div>
            <h3 className="text-sm text-blue-200 font-medium">Fast, Low-Cost Transfers</h3>
          </div>
        </div>
        <Info className="h-4 w-4 text-blue-300/70" />
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 overflow-hidden"
          >
            <div className="pb-3 text-xs text-blue-200/80 border-t border-blue-500/20 pt-2 space-y-2">              <p>
                We use advanced blockchain technology behind the scenes to minimize your transfer costs.
                You always send and receive money in {fiatCurrency}.
              </p>
              <p>
                This approach allows us to provide faster transfers, lower fees, and better security
                while keeping the experience simple for you.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
