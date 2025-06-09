
import { useState, useMemo } from "react";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { useStellarAccount } from "@/hooks/useStellarAccount";

export interface AnalyticsMetric {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export interface TransactionAnalytics {
  totalTransactions: number;
  totalVolume: number;
  avgTransactionSize: number;
  transactionsByType: Record<string, number>;
  recentTrend: "up" | "down" | "neutral";
  metrics: AnalyticsMetric[];
  transactionsByMonth: { month: string; income: number; expense: number }[];
  isLoading: boolean;
}

export function useTransactionAnalytics(): TransactionAnalytics {
  const { transactions, isLoading } = useTransactions();
  const { balance } = useStellarAccount();
  
  // Calculate analytics metrics from transactions
  const analytics = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalVolume: 0,
        avgTransactionSize: 0,
        transactionsByType: {},
        recentTrend: "neutral" as const,
        metrics: [],
        transactionsByMonth: [],
      };
    }
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Calculate total volume
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Calculate transactions by type
    const transactionsByType = transactions.reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Determine recent trend (last 3 transactions vs previous 3)
    let recentTrend: "up" | "down" | "neutral" = "neutral";
    if (transactions.length >= 6) {
      const recent3 = sortedTransactions.slice(0, 3).reduce((sum, tx) => 
        sum + (tx.type === "income" ? tx.amount : -tx.amount), 0);
      const previous3 = sortedTransactions.slice(3, 6).reduce((sum, tx) => 
        sum + (tx.type === "income" ? tx.amount : -tx.amount), 0);
      
      if (recent3 > previous3) recentTrend = "up";
      else if (recent3 < previous3) recentTrend = "down";
    }
    
    // Group transactions by month
    const byMonth: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!byMonth[monthYear]) {
        byMonth[monthYear] = { income: 0, expense: 0 };
      }
      
      if (tx.type === "income") {
        byMonth[monthYear].income += tx.amount;
      } else if (tx.type === "expense") {
        byMonth[monthYear].expense += tx.amount;
      }
    });
    
    // Convert to array for charts
    const transactionsByMonth = Object.entries(byMonth)
      .map(([month, data]) => ({
        month: new Date(month).toLocaleString('default', { month: 'short' }),
        income: data.income,
        expense: data.expense,
      }))
      .slice(-6); // Last 6 months
    
    // Calculate key metrics
    const totalTransactions = transactions.length;
    const avgTransactionSize = totalVolume / totalTransactions;
    
    // Income vs Expense ratio
    const incomeTotal = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenseTotal = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const netFlow = incomeTotal - expenseTotal;
    const netFlowFormatted = `${netFlow >= 0 ? "+" : ""}$${netFlow.toFixed(2)}`;
    
    // Build metrics array
    const metrics: AnalyticsMetric[] = [
      {
        title: "Total Volume",
        value: `$${totalVolume.toFixed(2)}`,
        trend: recentTrend
      },
      {
        title: "Net Flow",
        value: netFlowFormatted,
        trend: netFlow >= 0 ? "up" : "down"
      },
      {
        title: "Avg Transaction",
        value: `$${avgTransactionSize.toFixed(2)}`
      },
      {
        title: "Transaction Count",
        value: totalTransactions
      }
    ];
    
    return {
      totalTransactions,
      totalVolume,
      avgTransactionSize,
      transactionsByType,
      recentTrend,
      metrics,
      transactionsByMonth,
    };
  }, [transactions]);
  
  return {
    ...analytics,
    isLoading,
  };
}
