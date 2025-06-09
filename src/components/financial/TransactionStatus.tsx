import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, AlertTriangle, XCircle, RefreshCw, ArrowUpRight, ArrowDownLeft, History } from "lucide-react";
import { motion } from "framer-motion";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <Check className="h-5 w-5 text-green-400" />;
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-400" />;
    case "processing":
      return <AlertTriangle className="h-5 w-5 text-blue-400" />;
    case "failed":
      return <XCircle className="h-5 w-5 text-red-400" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-400";
    case "pending":
      return "text-yellow-400";
    case "processing":
      return "text-blue-400";
    case "failed":
      return "text-red-400";
    default:
      return "text-white";
  }
};

export function TransactionStatus() {
  const { transactions, isLoading, refetch, fiatRate, defaultFiat } = useTransactionHistory();
    // Format amount in fiat currency
  const formatAmount = (amount: string, assetType: string) => {
    const amountNum = parseFloat(amount);
    if (assetType === 'native' && fiatRate && fiatRate > 0) {
      const fiatAmount = amountNum * fiatRate;
      return `${fiatAmount.toFixed(2)} ${defaultFiat}`;
    }
    // For native asset without fiat rate, show in default fiat with placeholder
    if (assetType === 'native') {
      return `-- ${defaultFiat}`;
    }
    // For non-native assets, show the asset type without XLM reference
    return `${amountNum.toFixed(2)} ${assetType === 'XLM' ? defaultFiat : assetType}`;
  };
  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-white/10">
        <CardTitle className="text-xl font-semibold text-white">
          Recent Transactions Status
        </CardTitle>
        <Button variant="outline" size="icon" onClick={refetch} disabled={isLoading}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            transactions.slice(0, 5).map((transaction, index) => (
            <motion.div
              key={transaction.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/5 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    {transaction.transaction_type === 'payment' ? (
                      transaction.from_address === transaction.to_address ? (
                        <Clock className="h-5 w-5 text-blue-400" />
                      ) : transaction.from_address ? (
                        <ArrowUpRight className="h-5 w-5 text-green-400" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5 text-red-400" />
                      )
                    ) : (
                      <History className="h-5 w-5 text-purple-400" />
                    )}
                    <p className="text-lg font-semibold text-white">
                      {transaction.transaction_type === 'payment' ? 'Payment' : 
                       transaction.transaction_type === 'create_account' ? 'Account Created' : 
                       transaction.transaction_type || "Transaction"}
                    </p>
                  </div>                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-white/60 font-medium">{formatAmount(transaction.amount, transaction.asset_type)}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className={`text-sm font-medium ${getStatusColor(transaction.status || 'completed')}`}>
                      {(transaction.status || 'completed').charAt(0).toUpperCase() + (transaction.status || 'completed').slice(1)}
                    </p>
                    <p className="text-sm text-white/60">
                      {transaction.created_at ? formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true }) : ''}
                    </p>
                  </div>
                  {getStatusIcon(transaction.status || 'completed')}
                </div>
              </div>
            </motion.div>
          ))) : (            <div className="text-center py-8 border border-dashed border-white/20 rounded-lg">
              <History className="h-10 w-10 mx-auto mb-2 text-white/40" />
              <p className="text-white font-medium">No transactions found</p>
              <p className="text-white/60 text-sm mt-1">Transactions will appear here once you start using your account</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
