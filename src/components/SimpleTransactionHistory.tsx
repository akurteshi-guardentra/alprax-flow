
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export function SimpleTransactionHistory() {
  const { transactions, isLoading, refetch, fiatRate, defaultFiat } = useTransactionHistory();

  const formatAmount = (transaction: any) => {
    if (typeof fiatRate !== 'number' || isNaN(fiatRate) || fiatRate === null) {
      return `Loading... ${defaultFiat}`;
    }

    const numericAmount = parseFloat(transaction.amount);
    if (isNaN(numericAmount)) {
      return `Invalid Data ${defaultFiat}`;
    }

    const calculatedFiatAmount = (numericAmount * fiatRate).toFixed(2);
    return `${calculatedFiatAmount} ${defaultFiat}`;
  };

  if (isLoading) {
    return (
      <Card className="glass-card modern-shadow">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card modern-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-white">Recent Transactions</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={refetch}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction, index) => (
              <div
                key={transaction.id || index}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    {transaction.transaction_type === 'sent' ? (
                      <ArrowUpRight className="h-5 w-5 text-red-400" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {transaction.recipient_name || 
                       (transaction.transaction_type === 'sent' ? 'Sent Payment' : 'Received Payment')}
                    </p>
                    <p className="text-white/60 text-sm">
                      {transaction.created_at && formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.transaction_type === 'sent' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {transaction.transaction_type === 'sent' ? '-' : '+'}
                    {formatAmount(transaction)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <ArrowUpRight className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60">No transactions yet</p>
            <p className="text-white/40 text-sm">Your transactions will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
