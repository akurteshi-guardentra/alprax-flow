
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export function EnhancedTransactionList() {
  const { transactions, isLoading, error, refetch, fiatRate, defaultFiat } = useTransactionHistory();

  const getTransactionIcon = (type: string) => {
    return type === 'payment' || type === 'send' ? 
      <ArrowUpRight className="h-4 w-4 text-red-400" /> :
      <ArrowDownLeft className="h-4 w-4 text-green-400" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'XLM' && fiatRate > 0) {
      const fiatAmount = amount * fiatRate;
      return `${amount.toFixed(4)} XLM (~${fiatAmount.toFixed(2)} ${defaultFiat})`;
    }
    return `${amount.toFixed(4)} ${currency}`;
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 text-white/40 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-white/70 mb-4">Failed to load transactions</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Recent Transactions</CardTitle>
        <Button 
          onClick={() => refetch()} 
          variant="ghost" 
          size="sm"
          className="text-white/70 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/70 mb-4">No transactions yet</p>
            <p className="text-white/50 text-sm">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction, index) => (
              <motion.div
                key={transaction.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <p className="text-white font-medium">
                      {transaction.memo || transaction.recipient_name || 'Transaction'}
                    </p>
                    <p className="text-white/50 text-sm">
                      {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    {formatAmount(transaction.amount, transaction.from_asset)}
                  </p>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
