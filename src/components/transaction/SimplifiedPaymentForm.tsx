// Simplified payment form with automatic Stellar account handling
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Wallet, Send, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";
import { SimplifiedRecipientFinder } from "./SimplifiedRecipientFinder";
import { BlockchainInfoBanner } from "./BlockchainInfoBanner";
import { ensureSufficientFunds } from "@/lib/stellar/enhanced-account";
import { StellarAccount } from "@/lib/stellar/types";
import { useTransactionSubmission } from "@/hooks/useTransactionSubmission";

interface SimplifiedPaymentFormProps {
  stellarAccount: StellarAccount;
  availableFunds: number;
  isProcessing: boolean;
  onSubmitPayment: (destination: string, amount: string, memo: string, recipientInfo: {
    name?: string;
    id?: string;
  }) => Promise<{ success: boolean; hash?: string; error?: string }>;
  isMobile: boolean;
  defaultFiat?: string;
  fiatRate?: number;
}

export function SimplifiedPaymentForm({
  stellarAccount,
  availableFunds,
  isProcessing,
  onSubmitPayment,
  isMobile,
  defaultFiat = "EUR",
  fiatRate = 0
}: SimplifiedPaymentFormProps) {
  // Get fiat conversion utilities
  const { fiatAmount, setFiatAmount, fiatRate: hookFiatRate, defaultFiat: hookDefaultFiat } = useTransactionSubmission();
  
  // Use props if provided, otherwise use hook values
  const effectiveFiatRate = fiatRate || hookFiatRate;
  const effectiveDefaultFiat = defaultFiat || hookDefaultFiat;
  
  // Form state
  const [selectedRecipient, setSelectedRecipient] = useState<FavoriteRecipient | null>(null);
  const [description, setDescription] = useState("");
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle recipient selection
  const handleSelectRecipient = (recipient: FavoriteRecipient) => {
    setSelectedRecipient(recipient);
    setShowRecipientSelector(false);
  };
  // Validate form data
  const validateForm = () => {
    if (!selectedRecipient) {
      return { valid: false, reason: "Please select a recipient" };
    }

    if (!fiatAmount || isNaN(parseFloat(fiatAmount)) || parseFloat(fiatAmount) <= 0) {
      return { valid: false, reason: "Please enter a valid amount" };
    }

    // Convert fiat to XLM for validation against available funds
    const fiatAmountNum = parseFloat(fiatAmount);
    const xlmAmount = effectiveFiatRate > 0 ? fiatAmountNum / effectiveFiatRate : 0;
    
    if (xlmAmount > availableFunds) {
      return { valid: false, reason: "Insufficient funds" };
    }

    if (!description.trim()) {
      return { valid: false, reason: "Please enter a payment description" };
    }

    return { valid: true, reason: "" };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.valid) {
      toast.error(validation.reason);
      hapticFeedback("error");
      return;
    }

    if (!selectedRecipient) return;

    setIsSubmitting(true);
    hapticFeedback("medium");

    try {
      // First ensure the account has sufficient funds
      const hasFunds = await ensureSufficientFunds(stellarAccount);
      
      if (!hasFunds) {
        toast.error("Failed to ensure sufficient funds for transaction");
        return;
      }      // Convert fiat amount to XLM for the payment
      const fiatAmountNum = parseFloat(fiatAmount);
      const xlmAmount = effectiveFiatRate > 0 ? fiatAmountNum / effectiveFiatRate : 0;
      
      // Proceed with the payment using XLM amount
      const result = await onSubmitPayment(
        selectedRecipient.stellar_address,
        xlmAmount.toString(),
        description,
        {
          name: selectedRecipient.recipient_name,
          id: selectedRecipient.id
        }
      );

      if (result.success) {
        toast.success("Payment sent successfully!");
        hapticFeedback("success");
        
        // Reset form
        setFiatAmount("");
        setDescription("");
        setSelectedRecipient(null);
      } else {
        toast.error(result.error || "Failed to send payment");
        hapticFeedback("error");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
      hapticFeedback("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      key="simplified-payment-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={handleSubmit}
      className={cn(
        "space-y-4 sm:space-y-6 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm rounded-xl border border-slate-700/50",
        isMobile ? "p-4" : "p-6"
      )}
    >
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg sm:text-xl font-semibold text-white">Send Money</h3>
        </div>        <div className="flex items-center text-white/70 text-sm">
          <Wallet className="h-4 w-4 mr-1 text-white/60" />
          <span>
            {effectiveFiatRate > 0 
              ? `${(availableFunds * effectiveFiatRate).toFixed(2)} ${effectiveDefaultFiat}`
              : `-- ${effectiveDefaultFiat}` // Show placeholder when rate is loading
            }
          </span>
        </div>
      </div>
        <BlockchainInfoBanner className="mb-1" />
      
      <div className="space-y-4">
        {/* Recipient Selection */}
        <div className="space-y-2">
          <Label className="text-white">Recipient</Label>
          {showRecipientSelector ? (
            <div className="space-y-3">
              <SimplifiedRecipientFinder onSelectRecipient={handleSelectRecipient} />
              <Button
                type="button"
                variant="outline"
                className="w-full border-white/20 bg-transparent hover:bg-white/10 text-white"
                onClick={() => setShowRecipientSelector(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedRecipient ? (
                <div className="flex justify-between items-center p-3 rounded-lg border border-white/20 bg-white/5">                  <div>
                    <p className="text-white font-medium">{selectedRecipient.recipient_name}</p>
                    <p className="text-white/60 text-sm truncate max-w-[180px]">{selectedRecipient.relationship || 'Contact'}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 bg-transparent border-white/20 hover:bg-white/10 text-white"
                    onClick={() => setShowRecipientSelector(true)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  className="w-full bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => setShowRecipientSelector(true)}
                >
                  Select Recipient
                </Button>
              )}
            </div>
          )}
        </div>        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="amount" className="text-white">Amount ({effectiveDefaultFiat})</Label>            <span className="text-xs text-white/50">
              Available: {effectiveFiatRate > 0 
                ? `${(availableFunds * effectiveFiatRate).toFixed(2)} ${effectiveDefaultFiat}`
                : `-- ${effectiveDefaultFiat}` // Show placeholder when rate is loading
              }
            </span>
          </div>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              value={fiatAmount}
              onChange={(e) => setFiatAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="bg-white/10 border-white/20 text-white pr-12"
              disabled={isSubmitting}
            />
            <div className="absolute right-3 top-0 bottom-0 flex items-center">
              <span className="text-white/60">{effectiveDefaultFiat}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              className="h-6 px-2 py-1 text-xs text-blue-300 hover:text-blue-200"
              onClick={() => {
                const maxFiatAmount = effectiveFiatRate > 0 ? availableFunds * effectiveFiatRate : availableFunds;
                setFiatAmount(maxFiatAmount.toString());
              }}
              disabled={availableFunds <= 0 || isSubmitting}
            >
              Max
            </Button>
          </div>
        </div>
        
        {/* Payment Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-white">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this payment for?"
            className="min-h-[80px] bg-white/10 border-white/20 text-white"
            disabled={isSubmitting}
          />
        </div>
          {/* Info note */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
          <Info className="h-4 w-4 text-white/60 mt-0.5 shrink-0" />
          <p className="text-xs text-white/70">
            Payments are processed securely and instantly. The recipient will receive the funds immediately and the transaction cannot be reversed.
          </p>
        </div>
        
        {/* Send Button */}
        <Button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
          disabled={isProcessing || isSubmitting || !selectedRecipient}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Send Payment
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
}
