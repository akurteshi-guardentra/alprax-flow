
import { motion } from 'framer-motion';
import { AlertTriangle, Send, Shield, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { FavoriteRecipient } from '@/types/favoriteRecipient';

interface TransactionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipient: FavoriteRecipient;
  amount: string;
  currency: string;
  xlmAmount: string;
  memo: string;
  isProcessing: boolean;
}

export function TransactionConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  recipient,
  amount,
  currency,
  xlmAmount,
  memo,
  isProcessing
}: TransactionConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <ModernCard variant="glass" className="w-full max-w-md">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Confirm Payment
          </ModernCardTitle>
        </ModernCardHeader>
        
        <ModernCardContent className="space-y-6">
          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">Recipient</span>
                <span className="text-white font-medium">{recipient.recipient_name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">Amount</span>
                <span className="text-white font-medium">{amount} {currency}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">XLM Amount</span>
                <span className="text-white/60 text-sm">{xlmAmount} XLM</span>
              </div>
              {memo && (
                <div className="flex justify-between items-start">
                  <span className="text-white/70">Memo</span>
                  <span className="text-white/60 text-sm text-right max-w-[200px]">{memo}</span>
                </div>
              )}
            </div>

            {/* Fee Information */}
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-medium">Transaction Fee</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Network Fee</span>
                <span className="text-white">0.00001 XLM (~$0.001)</span>
              </div>
            </div>

            {/* Processing Time */}
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Estimated processing time: 3-5 seconds</span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-300">
              <div className="font-medium mb-1">Important Notice</div>
              This transaction cannot be reversed once confirmed. Please verify all details carefully.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </div>
        </ModernCardContent>
      </ModernCard>
    </motion.div>
  );
}
