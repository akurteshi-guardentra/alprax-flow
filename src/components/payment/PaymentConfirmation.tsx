import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RecipientAccountValidator } from './RecipientAccountValidator';

interface PaymentConfirmationProps {
  recipient: {
    name: string;
    stellar_address: string;
    country?: string;
  };
  amount: string;
  currency: string;
  xlmAmount: string;
  memo: string;
  onConfirm: () => void;
  onBack: () => void;
  isProcessing?: boolean;
}

export function PaymentConfirmation({
  recipient,
  amount,
  currency,
  xlmAmount,
  memo,
  onConfirm,
  onBack,
  isProcessing = false
}: PaymentConfirmationProps) {
  const [validationPassed, setValidationPassed] = useState(false);
  const [needsFunding, setNeedsFunding] = useState(false);

  const handleValidationChange = (isValid: boolean, requiresFunding: boolean) => {
    setValidationPassed(isValid);
    setNeedsFunding(requiresFunding);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Confirm Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">To:</span>
                <div className="text-right">
                  <span className="font-medium">{recipient.name}</span>
                  {recipient.country && (
                    <div className="text-xs text-white/50">{recipient.country}</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">Stellar Address:</span>
                <div className="text-right">
                  <span className="font-mono text-xs text-white/80">
                    {recipient.stellar_address.slice(0, 8)}...{recipient.stellar_address.slice(-8)}
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${recipient.stellar_address}`, '_blank')}
                    className="ml-2 text-xs text-primary hover:text-primary/80 p-0 h-auto"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">Amount:</span>
                <span className="font-medium">{amount} {currency}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">XLM Amount:</span>
                <span className="font-medium">{xlmAmount} XLM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Purpose:</span>
                <span className="font-medium">{memo}</span>
              </div>
            </div>

            {/* Account Validation */}
            <RecipientAccountValidator
              stellarAddress={recipient.stellar_address}
              onValidationChange={handleValidationChange}
            />

            {/* Status indicators */}
            {validationPassed && !needsFunding && (
              <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">Payment ready to send</span>
              </div>
            )}

            {needsFunding && (
              <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm">
                  Recipient account needs activation before payment can be sent
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Back
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isProcessing || (!validationPassed && needsFunding)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : needsFunding ? (
                'Activate Account First'
              ) : (
                'Send Payment'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}