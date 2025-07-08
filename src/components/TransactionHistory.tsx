
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { formatDistanceToNow, format, isToday, isYesterday, isSameWeek, isSameMonth, isSameYear } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowDownLeft, ArrowUpRight, RefreshCw, Star, 
  ChevronRight, Filter, Download, Calendar, Search 
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { TransactionDetail } from './transaction/TransactionDetail';
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { VirtualizedList } from "@/components/ui/virtualized-list";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh-indicator";
import { hapticFeedback } from "@/lib/haptics";
import { SwipeableTransactionItem } from "@/components/ui/swipeable-transaction-item";
import { TransactionList } from "./transaction/TransactionList";
import { TransactionSkeleton } from "@/components/ui/transaction-skeleton";
import { groupTransactionsByDate } from "@/utils/transaction-utils";
import { prefetchResources, hasGoodConnection } from "@/utils/prefetch-utils";
import { useDataSaverMode } from "@/hooks/use-data-saver";
import { useNetworkConditions } from "@/hooks/use-network-conditions";
import { usePerformanceMetrics } from "@/hooks/use-performance-metrics";
import { safeGetItem, safeSetItem } from "@/utils/storage-utils";
import { PerformanceInfo } from "@/components/ui/performance-info";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { useNetworkAwareLoading } from "@/hooks/use-network-aware-loading";
import { transactionCache } from "@/utils/transaction-cache";
import { SmartSkeleton } from "@/components/ui/smart-skeleton";
import { OfflineIndicator } from "@/components/ui/offline-indicator";

export function TransactionHistory() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [favoriteTransactionIds, setFavoriteTransactionIds] = useState<string[]>([]);
  const [groupedView, setGroupedView] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  // Use data saver mode to optimize performance
  const { isLowEndDevice, isDataSaverEnabled } = useDataSaverMode();
  
  // Network and loading optimization hooks
  const { isOnline, effectiveType } = useNetworkConditions();
  const { 
    imageQuality, 
    loadingStrategy, 
    getOptimizedImageSize
  } = useNetworkAwareLoading();
  
  // Animation optimizations
  const { 
    getItemVariants, 
    shouldAnimate, 
    getTransition 
  } = useOptimizedAnimations();
  
  // Get transactions from API
  const {
    transactions,
    isLoading,
    error,
    refetch,
    fiatRate,
    defaultFiat
  } = useTransactionHistory();
  
  const [refreshing, setRefreshing] = useState(false);

  // Use performance metrics to track component performance
  const { measureRenderTime } = usePerformanceMetrics();
  
  // Handler for manual refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    hapticFeedback('medium');
    
    try {
      await refetch();
      hapticFeedback('success');
    } catch (error) {
      hapticFeedback('error');
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Filter transactions based on search term
  useEffect(() => {
    if (!transactions || !searchTerm.trim()) {
      setFilteredTransactions(null);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = transactions.filter(transaction => 
      (transaction.recipient_name && transaction.recipient_name.toLowerCase().includes(term)) ||
      (transaction.memo && transaction.memo.toLowerCase().includes(term)) ||
      (transaction.transfer_purpose && transaction.transfer_purpose.toLowerCase().includes(term)) ||
      (transaction.transfer_category && transaction.transfer_category.toLowerCase().includes(term))
    );
    
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);
  
  // Get the transactions to display (either filtered or all)
  const displayTransactions = filteredTransactions || transactions;

  const handleRowClick = useCallback((transaction) => {
    setSelectedTransaction(transaction);
  }, []);

  const closeTransactionDetail = useCallback(() => {
    setSelectedTransaction(null);
  }, []);
  
  // Helper function to load more data for infinite scrolling (for mobile view)
  const loadMoreTransactions = useCallback(() => {
    console.log('Loading more transactions...');
  }, []);

  // Helper function to format amounts with appropriate prefix
  const formatAmount = (transaction) => {
    if (typeof fiatRate !== 'number' || isNaN(fiatRate) || fiatRate === null || fiatRate === undefined) {
      return `Loading... ${defaultFiat}`;
    }

    const numericAmount = parseFloat(transaction.amount);
    if (isNaN(numericAmount)) {
      console.warn(`Invalid amount for transaction (ID: ${transaction.id || 'unknown'}), amount: ${transaction.amount}`);
      return `Invalid Data ${defaultFiat}`;
    }

    const calculatedFiatAmount = (numericAmount * fiatRate).toFixed(2);
    if (transaction.transaction_type === 'sent') {
      return `-${calculatedFiatAmount} ${defaultFiat}`;
    } else if (transaction.transaction_type === 'received') {
      return `+${calculatedFiatAmount} ${defaultFiat}`;
    } else {
      return `${calculatedFiatAmount} ${defaultFiat}`;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <SmartSkeleton count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading transactions</p>
        <Button onClick={handleRefresh} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {displayTransactions && displayTransactions.length > 0 ? (
            <div className="space-y-2">
              {displayTransactions.map((transaction, index) => (
                <div 
                  key={transaction.id} 
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(transaction)}
                >
                  <div className="flex justify-between items-center">
                    <span>{transaction.recipient_name || 'Unknown'}</span>
                    <span>{formatAmount(transaction)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No transactions found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
