import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { CheckCircle, Clock, Share2, ExternalLink } from "lucide-react";
import { TransactionTimeline } from "./TransactionTimeline";
import { TransactionTimelineEvent } from "@/services/stellar/types";
import { trackTransaction } from "@/services/stellar/history";
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";

interface TransactionSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: any;
  amount: string; // This will be fiatAmount
  transactionId: string;
  defaultFiat: string; // Added defaultFiat
}

export function TransactionSuccess({
  isOpen,
  onClose,
  recipient,
  amount, // fiatAmount
  transactionId,
  defaultFiat, // Added
}: TransactionSuccessProps) {
  const [timeline, setTimeline] = useState<TransactionTimelineEvent[]>([
    { status: "initiated", timestamp: new Date().toISOString() },
    { status: "submitted", timestamp: new Date().toISOString() },
  ]);

  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // Get transaction status from Supabase
  useEffect(() => {
    if (!isOpen || !transactionId) return;

    // Simulate transaction progress for demo
    // In a real app, we would pull this from the database
    setTimeout(() => {
      setTimeline((prev) => [
        ...prev,
        { status: "pending", timestamp: new Date().toISOString() },
      ]);

      // Simulate transaction completion after 3 seconds
      setTimeout(() => {
        setTimeline((prev) => [
          ...prev,
          { status: "completed", timestamp: new Date().toISOString() },
        ]);
        setIsCompleted(true);

        // Launch confetti when transaction is completed
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Simulate recipient receiving the funds after 2 more seconds
        setTimeout(() => {
          setTimeline((prev) => [
            ...prev,
            { status: "received", timestamp: new Date().toISOString() },
          ]);
        }, 2000);
      }, 3000);
    }, 1500);
  }, [isOpen, transactionId]);

  // Track real transaction if hash is available
  useEffect(() => {
    if (!isOpen || !transactionHash) return;

    const checkStatus = async () => {
      try {
        const status = await trackTransaction(transactionHash);
        if (status.status === "completed" && !isCompleted) {
          setTimeline((prev) => [
            ...prev,
            { status: "completed", timestamp: new Date().toISOString() },
          ]);
          setIsCompleted(true);

          // Launch confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (error) {
        console.error("Error tracking transaction:", error);
      }
    };

    // Only check if not already completed
    if (!isCompleted) {
      // Check immediately
      checkStatus();

      // Then check every 5 seconds
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, transactionHash, isCompleted]);
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Money Sent!",
          text: `I just sent ${amount} to ${recipient.recipient_name} using Alprax!`,
          url: window.location.href,
        });
        setIsShared(true);
      } else {
        throw new Error("Web Share API not supported");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Copy to clipboard as fallback
      navigator.clipboard.writeText(
        `I just sent ${amount} to ${recipient.recipient_name} using Alprax!`
      );
      toast.success("Copied to clipboard!");
      setIsShared(true);
    }
    hapticFeedback("light");
  };
  const handleViewTransaction = () => {
    // Open transaction details
    if (transactionHash) {
      // Still using the blockchain explorer, but with a user-friendly description
      window.open(
        `https://stellar.expert/explorer/testnet/tx/${transactionHash}`,
        "_blank"
      );
      toast.info("Viewing detailed transaction receipt");
    } else {
      toast.info("Transaction reference not available yet");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-md w-full">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="flex flex-col items-center justify-center text-center pt-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full filter blur-md"></div>
              <div className="relative h-16 w-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
                {isCompleted ? (
                  <CheckCircle className="h-8 w-8 text-white" />
                ) : (
                  <Clock className="h-8 w-8 text-white animate-pulse" />
                )}
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">
              {isCompleted ? "Transaction Complete" : "Processing Transaction"}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {isCompleted
                ? "Your money is on its way!"
                : "Please wait while we process your transaction"}
            </p>
          </motion.div>
        </DialogHeader>

        <div className="space-y-6 pt-2 pb-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-white/60 text-sm">Amount</span>
              <span className="font-medium text-lg text-white">
                {amount} {defaultFiat}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">Recipient</span>
              <span className="font-medium text-white">
                {recipient.recipient_name}
              </span>
            </div>
          </div>

          <TransactionTimeline
            timeline={timeline}
            transactionType="sent"
            className="bg-white/5 rounded-lg"
          />

          <div className="flex justify-between gap-2">
            <Button
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
              onClick={onClose}
            >
              {isCompleted ? "Done" : "Close"}
            </Button>

            {isCompleted && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-slate-600 hover:bg-slate-700"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  {isShared ? "Shared" : "Share"}
                </Button>                <Button
                  variant="outline"
                  className="border-slate-600 hover:bg-slate-700"
                  onClick={handleViewTransaction}
                  title="View Transaction Receipt"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span className="sr-only md:not-sr-only md:inline-block">Details</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
