
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Copy, Info, Share2, Download, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TransactionTimelineEvent, TransactionTimeline } from './TransactionTimeline';
import { FavoriteRecipient } from "@/types/favoriteRecipient";

interface TransactionSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: FavoriteRecipient;
  amount: string;
  transactionId: string;
  defaultFiat: string;
}

const TransactionSuccess = ({ 
  isOpen, 
  onClose, 
  recipient, 
  amount, 
  transactionId, 
  defaultFiat 
}: TransactionSuccessProps) => {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const isMobile = useIsMobile();
  
  if (!isOpen) return null;
  
  const handleCopyClick = () => {
    navigator.clipboard.writeText(transactionId);
    setIsCopied(true);
    toast.success("Transaction ID copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareReceipt = () => {
    const shareText = `Payment Receipt\n\nSent ${amount} ${defaultFiat} to ${recipient.recipient_name}\nTransaction ID: ${transactionId}\nStatus: Completed\n\nPowered by Alprax`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Payment Receipt',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Receipt copied to clipboard!");
    }
  };

  const handleSendAnother = () => {
    onClose();
  };
  
  const timelineEvents: TransactionTimelineEvent[] = [
    {
      id: "1",
      title: "Payment Initiated",
      description: "Your payment request has been processed and confirmed.",
      timestamp: new Date(Date.now() - 60000).toISOString(),
      status: "completed",
    },
    {
      id: "2",
      title: "Funds Transferred", 
      description: `${amount} ${defaultFiat} has been sent to ${recipient.recipient_name}.`,
      timestamp: new Date(Date.now() - 30000).toISOString(),
      status: "completed",
    },
    {
      id: "3",
      title: "Payment Completed",
      description: "The recipient has been notified and can access the funds immediately.",
      timestamp: new Date().toISOString(),
      status: "completed",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-emerald-900 to-gray-900 relative overflow-hidden max-w-md w-full rounded-xl">
        {/* Gradient effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-green-500/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000" />
        </div>

        <div className="relative p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-400" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white">Payment Sent Successfully!</h1>
              <div className="space-y-1">
                <p className="text-white/90 font-medium text-lg">
                  {amount} {defaultFiat}
                </p>
                <p className="text-white/70 text-sm">
                  has been sent to <span className="font-medium text-white">{recipient.recipient_name}</span>
                </p>
              </div>
            </div>

            {/* Recipient Confirmation */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-500/20 text-blue-400">
                      {recipient.recipient_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium">{recipient.recipient_name}</p>
                    <p className="text-white/60 text-sm">will be notified instantly</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    Delivered
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Details */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-semibold text-base">Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Transaction ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-xs">{transactionId.slice(0, 12)}...</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white/50 hover:text-white h-6 w-6"
                      onClick={handleCopyClick}
                      disabled={isCopied}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Processing Time:</span>
                  <span className="text-white font-medium text-sm">Instant</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Network Fee:</span>
                  <span className="text-white font-medium text-sm">~{(parseFloat(amount) * 0.001).toFixed(2)} {defaultFiat}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleShareReceipt}
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleSendAnother}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Again
              </Button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl border border-green-500/20">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-400">Secure & Instant</h4>
                  <p className="text-xs text-blue-300/70 mt-1">
                    Your payment was processed securely using blockchain technology and delivered instantly.
                  </p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
            >
              Return to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSuccess;
