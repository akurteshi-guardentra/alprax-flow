import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Copy, Download, ExternalLink, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { motion } from "framer-motion";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TransactionTimelineEvent, TransactionTimeline } from './TransactionTimeline';

interface TransactionSuccessProps {
  transactionId: string;
}

const TransactionSuccess = ({ transactionId }: TransactionSuccessProps) => {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { isMobile } = useMobile();
  
  const handleCopyClick = () => {
    navigator.clipboard.writeText(transactionId);
    setIsCopied(true);
    toast.success("Transaction ID copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const timelineEvents: TransactionTimelineEvent[] = [
    {
      id: "1",
      title: "Transaction Initiated",
      description: "Your transaction has been initiated and is awaiting confirmation.",
      timestamp: new Date().toISOString(),
      status: "pending",
    },
    {
      id: "2",
      title: "Funds Confirmed",
      description: "The funds have been confirmed and are being processed.",
      timestamp: new Date(Date.now() + 30000).toISOString(),
      status: "pending",
    },
    {
      id: "3",
      title: "Transaction Completed",
      description: "The transaction has been completed and the funds have been sent.",
      timestamp: new Date(Date.now() + 60000).toISOString(),
      status: "completed",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-gray-900 relative overflow-hidden">
      {/* Gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-green-500/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-3xl mx-auto relative px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 space-y-6"
        >
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Transaction Successful</h1>
            <p className="text-white/60 max-w-md mx-auto">
              Your transaction has been successfully processed. Here are the details:
            </p>
          </div>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-semibold">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Transaction ID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{transactionId}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white/50 hover:text-white"
                    onClick={handleCopyClick}
                    disabled={isCopied}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy transaction ID</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">Status:</span>
                <Badge variant="secondary" className="bg-green-500 text-white">
                  Completed
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">Date:</span>
                <span className="text-white font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">Amount:</span>
                <span className="text-white font-medium">$100.00</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">Recipient:</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Recipient" />
                    <AvatarFallback>RC</AvatarFallback>
                  </Avatar>
                  <span className="text-white font-medium">John Doe</span>
                </div>
              </div>
            </CardContent>
          </Card>

              <TransactionTimeline
                events={timelineEvents}
                transactionType="sent"
                className="mt-6"
              />
              
          <div className="mt-8 p-5 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl border border-green-500/20">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-400">Transaction Security</h4>
                <p className="text-sm text-blue-300/70 mt-1">
                  This transaction was processed with industry-leading security measures. Your funds are protected by advanced encryption and fraud detection systems.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TransactionSuccess;
