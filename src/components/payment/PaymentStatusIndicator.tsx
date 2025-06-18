
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export type PaymentStatus = 'idle' | 'validating' | 'processing' | 'success' | 'error';

interface PaymentStatusIndicatorProps {
  status: PaymentStatus;
  message?: string;
}

export function PaymentStatusIndicator({ status, message }: PaymentStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'validating':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          defaultMessage: 'Validating payment details...'
        };
      case 'processing':
        return {
          icon: Clock,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          defaultMessage: 'Processing payment...'
        };
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          defaultMessage: 'Payment successful!'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          defaultMessage: 'Payment failed'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config || status === 'idle') return null;

  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      <Icon 
        className={`w-4 h-4 ${config.color} ${status === 'processing' || status === 'validating' ? 'animate-spin' : ''}`} 
      />
      <span className={`text-sm ${config.color}`}>
        {displayMessage}
      </span>
    </motion.div>
  );
}
