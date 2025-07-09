import { memo } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Share, Download, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SuccessStepProps {
  data: Record<string, any>;
  onComplete: () => void;
}

export const SuccessStep = memo(function SuccessStep({
  data,
  onComplete
}: SuccessStepProps) {
  const handleShare = () => {
    // Implement share functionality
    console.log('Share receipt');
  };

  const handleDownload = () => {
    // Implement download receipt functionality
    console.log('Download receipt');
  };

  const handleSendAnother = () => {
    // Reset wizard to send another payment
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
        className="mx-auto w-20 h-20"
      >
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
      </motion.div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">Payment Successful!</h3>
        <p className="text-white/70">
          Your payment has been sent successfully to {data.recipient?.recipient_name}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-lg p-4 space-y-3"
      >
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Amount:</span>
          <span className="text-white font-medium">{data.amount} EUR</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Recipient:</span>
          <span className="text-white font-medium">{data.recipient?.recipient_name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Transaction ID:</span>
          <span className="text-white font-mono text-xs">{data.transactionId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Status:</span>
          <span className="text-green-400 font-medium">Completed</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3"
      >
        <div className="flex gap-3">
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Receipt
          </Button>
        </div>

        <Button
          onClick={handleSendAnother}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Send Another Payment
        </Button>

        <Button
          onClick={onComplete}
          variant="outline"
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </motion.div>
    </motion.div>
  );
});