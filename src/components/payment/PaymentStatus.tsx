
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, ArrowRight, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface PaymentStatusProps {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: string;
  recipient: string;
  onClose: () => void;
}

export function PaymentStatus({ 
  transactionId, 
  status, 
  amount, 
  recipient, 
  onClose 
}: PaymentStatusProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status]);

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionId);
    toast.success('Transaction ID copied');
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-400" />,
          title: 'Payment Successful',
          color: 'text-green-400',
          description: 'Your payment has been completed successfully'
        };
      case 'pending':
        return {
          icon: <Clock className="h-16 w-16 text-yellow-400 animate-pulse" />,
          title: 'Payment Processing',
          color: 'text-yellow-400',
          description: 'Your payment is being processed on the blockchain'
        };
      case 'failed':
        return {
          icon: <AlertTriangle className="h-16 w-16 text-red-400" />,
          title: 'Payment Failed',
          color: 'text-red-400',
          description: 'Your payment could not be completed'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen modern-gradient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="glass-card modern-shadow">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              {statusConfig.icon}
            </div>

            <h2 className={`text-2xl font-bold mb-2 ${statusConfig.color}`}>
              {statusConfig.title}
            </h2>

            <p className="text-white/70 mb-6">
              {statusConfig.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Amount:</span>
                <span className="text-white font-medium">{amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">To:</span>
                <span className="text-white font-medium">{recipient}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Status:</span>
                <Badge variant={status === 'completed' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}>
                  {status}
                </Badge>
              </div>
              {status === 'pending' && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Time elapsed:</span>
                  <span className="text-white font-medium">{timeElapsed}s</span>
                </div>
              )}
            </div>

            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Transaction ID</p>
                  <p className="text-white font-mono text-sm">
                    {transactionId.slice(0, 8)}...{transactionId.slice(-8)}
                  </p>
                </div>
                <Button
                  onClick={copyTransactionId}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary-light text-white flex items-center justify-center"
            >
              {status === 'completed' ? 'Done' : 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {status === 'failed' && (
              <Button
                variant="outline"
                className="w-full mt-3 border-white/20 text-white hover:bg-white/10"
                onClick={() => {/* Retry logic */}}
              >
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
