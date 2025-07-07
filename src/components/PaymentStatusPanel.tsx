import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEnhancedPayment } from "@/hooks/useEnhancedPayment";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  XCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PaymentStatusPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    pendingTransactions,
    failedTransactions,
    unresolvedErrors,
    isProcessing,
    retryTransaction,
    markErrorResolved,
    processQueue
  } = useEnhancedPayment();

  const totalIssues = pendingTransactions.length + failedTransactions.length + unresolvedErrors.length;

  if (totalIssues === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Payment Status ({totalIssues})
          </CardTitle>
          <div className="flex items-center gap-2">
            {pendingTransactions.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={processQueue}
                disabled={isProcessing}
                className="h-7 px-2 text-xs bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
              >
                {isProcessing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  'Process Queue'
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 p-0 text-slate-400 hover:text-white"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 space-y-3">
              {/* Pending Transactions */}
              {pendingTransactions.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-400 mb-2">Pending Transactions</h4>
                  <div className="space-y-2">
                    {pendingTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-2 bg-slate-900/50 rounded-md border border-slate-700/50"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <div className="text-xs">
                            <p className="font-medium">{transaction.amount} XLM</p>
                            <p className="text-slate-400 truncate max-w-[120px]">
                              {transaction.recipient_address.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(transaction.status))}>
                          {transaction.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed Transactions */}
              {failedTransactions.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-400 mb-2">Failed Transactions</h4>
                  <div className="space-y-2">
                    {failedTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-2 bg-slate-900/50 rounded-md border border-slate-700/50"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <div className="text-xs">
                            <p className="font-medium">{transaction.amount} XLM</p>
                            <p className="text-slate-400 truncate max-w-[120px]">
                              {transaction.error_message || 'Unknown error'}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryTransaction(transaction.id)}
                          disabled={isProcessing}
                          className="h-6 px-2 text-xs bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                        >
                          Retry
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unresolved Errors */}
              {unresolvedErrors.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-400 mb-2">Recent Errors</h4>
                  <div className="space-y-2">
                    {unresolvedErrors.slice(0, 3).map((error) => (
                      <div
                        key={error.id}
                        className="flex items-center justify-between p-2 bg-slate-900/50 rounded-md border border-slate-700/50"
                      >
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <div className="text-xs">
                            <p className="font-medium text-red-300">{error.error_type}</p>
                            <p className="text-slate-400 truncate max-w-[120px]">
                              {error.error_message}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markErrorResolved(error.id)}
                          className="h-6 px-2 text-xs bg-gray-500/20 border-gray-500/30 text-gray-300 hover:bg-gray-500/30"
                        >
                          Dismiss
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}