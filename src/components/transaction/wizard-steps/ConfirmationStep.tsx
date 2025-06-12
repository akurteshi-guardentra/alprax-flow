
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, User, DollarSign, MessageSquare, Send } from "lucide-react";
import { FavoriteRecipient } from "@/types/favoriteRecipient";

interface ConfirmationStepProps {
  selectedRecipient: FavoriteRecipient | null;
  amount: string;
  description: string;
  defaultFiat: string;
  isProcessing: boolean;
  onConfirm: () => void;
}

export function ConfirmationStep({
  selectedRecipient,
  amount,
  description,
  defaultFiat,
  isProcessing,
  onConfirm
}: ConfirmationStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Confirm Your Payment</h3>
        <p className="text-white/70">Review the details before sending</p>
      </div>

      {/* Final Summary */}
      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-start gap-3 mb-3">
            <User className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Sending to</p>
              <p className="text-white text-lg">{selectedRecipient?.recipient_name}</p>
              <p className="text-white/60 text-sm">{selectedRecipient?.relationship || 'Contact'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-3">
            <DollarSign className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Amount</p>
              <p className="text-white text-xl font-semibold">{amount} {defaultFiat}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Purpose</p>
              <p className="text-white">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-200">
            <p className="font-medium mb-1">Secure Transaction</p>
            <p>This payment will be processed immediately and cannot be reversed. Please verify all details are correct.</p>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={onConfirm}
        disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Processing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Confirm & Send Payment
          </>
        )}
      </Button>
    </motion.div>
  );
}
