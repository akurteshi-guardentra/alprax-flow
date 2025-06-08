import { useStellarAccount } from "@/hooks/useStellarAccount";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Copy, Check, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";
import { useState } from "react";
import { StellarAccount } from "@/lib/stellar/types";
import { motion, AnimatePresence } from "framer-motion";

export function AccountDetails() {
  const { account } = useStellarAccount();
  const [copied, setCopied] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Account ID copied to clipboard");
    hapticFeedback("light");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!account) return null;
  
  const typedAccount = account as StellarAccount;

  return (
    <div className="bg-white/5 rounded p-3">
      <div className="flex justify-between items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-white/60 text-sm flex items-center">
                Account Information
                <Info className="ml-1 h-3 w-3 text-white/40" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white border-white/20 max-w-xs">
              <p>Your secure payment account information</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-white/60 hover:text-white hover:bg-white/10 flex items-center"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
        >
          Technical Details
          {showTechnicalDetails ? (
            <ChevronUp className="ml-1 h-3 w-3" />
          ) : (
            <ChevronDown className="ml-1 h-3 w-3" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showTechnicalDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pb-2 border-b border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-xs">Payment Network ID</span>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={() => copyToClipboard(typedAccount.publicKey)}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-white/60 hover:text-white hover:bg-white/10"
                          onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${typedAccount.publicKey}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-white border-white/20">
                        <p>View technical details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <p className="text-white/80 text-sm font-mono mt-1 break-all">
                {typedAccount.publicKey.slice(0, 8)}...{typedAccount.publicKey.slice(-8)}
              </p>
              <div className="mt-2 bg-blue-500/10 p-2 rounded border border-blue-500/20">
                <p className="text-xs text-blue-300 flex items-center">
                  <Info className="h-3 w-3 mr-1 text-blue-400" />
                  This is a test account for development purposes
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showTechnicalDetails && (
        <div className="mt-2 bg-green-500/10 p-2 rounded border border-green-500/20">
          <p className="text-xs text-green-300 flex items-center">
            <Info className="h-3 w-3 mr-1 text-green-400" />
            Your account is active and ready to send or receive funds
          </p>
        </div>
      )}
    </div>
  );
}
