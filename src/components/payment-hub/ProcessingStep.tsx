import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProcessingStepProps {
  data: Record<string, any>;
  onNext: (data?: any) => void;
  onBack: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export const ProcessingStep = memo(function ProcessingStep({
  data,
  onNext,
  isProcessing,
  setIsProcessing
}: ProcessingStepProps) {
  useEffect(() => {
    // Simulate payment processing
    setIsProcessing(true);
    const timer = setTimeout(() => {
      setIsProcessing(false);
      onNext({ transactionId: 'tx_' + Date.now(), status: 'completed' });
    }, 3000);

    return () => clearTimeout(timer);
  }, [setIsProcessing, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 text-center space-y-6"
    >
      <div className="mx-auto w-24 h-24 relative">
        {isProcessing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-full h-full"
          >
            <Loader2 className="w-24 h-24 text-blue-500" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CheckCircle className="w-24 h-24 text-green-500" />
          </motion.div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">
          {isProcessing ? 'Processing Payment...' : 'Payment Successful!'}
        </h3>
        <p className="text-white/70">
          {isProcessing 
            ? 'Please wait while we process your payment securely'
            : 'Your payment has been sent successfully'
          }
        </p>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="text-sm text-white/60">
            Sending ${data.amount} to {data.recipient?.name}
          </div>
          <div className="text-xs text-white/50">
            {data.recipient?.identifier && `To: ${data.recipient.identifier}`}
          </div>
          <div className="text-xs text-white/50">
            Processing securely...
          </div>
        </div>
      )}

      {!isProcessing && (
        <Button
          onClick={() => onNext()}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          View Details
        </Button>
      )}
    </motion.div>
  );
});