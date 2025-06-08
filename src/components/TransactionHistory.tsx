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
import { usePullToRefresh } from "@/hooks/use-pull-refresh";
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
// New imports for enhanced mobile optimization
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
  const [filteredTransactions, setFilteredTransactions] = useState(null);  const contentRef = useRef<HTMLDivElement>(null);
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
  
  const [refreshing, setRefreshing] = useState(false);  // Use performance metrics to track component performance
  const { 
    lastRenderTime, 
    averageRenderTime, 
    trackInteractionStart, 
    trackInteractionEnd 
  } = usePerformanceMetrics(process.env.NODE_ENV === 'development', {
    componentName: 'TransactionHistory',
    trackInteractions: true,
    trackRenders: true,
    trackMemory: false
  });
  
  // Handler for manual refresh
  const handleRefresh = useCallback(async () => {
    if (trackInteractionStart) trackInteractionStart(); // Start tracking the interaction
    setRefreshing(true);
    hapticFeedback('medium');
    
    try {
      await refetch();
      hapticFeedback('success');
    } catch (error) {
      hapticFeedback('error');
    } finally {
      setRefreshing(false);
      if (trackInteractionEnd) trackInteractionEnd(); // End tracking the interaction
    }
  }, [refetch, trackInteractionStart, trackInteractionEnd]);
  
  // Pull-to-refresh functionality for mobile
  const { isPulling, pullProgress, isRefreshing } = usePullToRefresh(contentRef, {
    onRefresh: handleRefresh,
    disabled: !isMobile || isLoading || refreshing,
    pullDistance: 80,
  });

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
    // Implement load more logic if needed
    console.log('Loading more transactions...');
    // Could fetch more transactions from API here
  }, []);

  // Helper function to format amounts with appropriate prefix
  const formatAmount = (transaction) => {
    // Ensure fiatRate is a valid number before calculation
    if (typeof fiatRate !== 'number' || isNaN(fiatRate) || fiatRate === null || fiatRate === undefined) {
      // Return a placeholder or loading text if fiatRate is not available
      // defaultFiat should be available as it's typically initialized directly
      return `Loading... ${defaultFiat}`;
    }

    const numericAmount = parseFloat(transaction.amount);
    if (isNaN(numericAmount)) {
      // Handle cases where transaction.amount is not a valid number
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
  
  // Transaction item component for consistent rendering
  const TransactionItem = useCallback(({ transaction, index, isVirtualized = false }) => {
    const baseClasses = "p-3 my-2 cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl shadow-sm hover:shadow transition-all duration-200 group";
    
    const transactionContent = (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center 
            ${transaction.transaction_type === 'sent' 
              ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' 
              : transaction.transaction_type === 'received'
                ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-light'
                : 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-light'
            }
          `}>
            {transaction.transaction_type === 'sent' ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : transaction.transaction_type === 'received' ? (
              <ArrowDownLeft className="h-5 w-5" />
            ) : (
              <Star className="h-5 w-5" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white flex items-center">
              {transaction.transaction_type === 'sent' ? (
                <>Sent to {transaction.recipient_name || "Contact"}</>
              ) : transaction.transaction_type === 'received' ? (
                <>Received from {transaction.recipient_name || "Contact"}</>
              ) : transaction.transaction_type === 'funding' ? (
                <>Account Funding</>
              ) : (
                <>{transaction.transaction_type || transaction.type}</>
              )}
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {transaction.memo && <div className="truncate max-w-[200px]">{transaction.memo}</div>}
              {!transaction.memo && transaction.transfer_purpose && <div className="truncate max-w-[200px]">{transaction.transfer_purpose}</div>}
            </div>
            
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDistanceToNow(new Date(transaction.created_at || transaction.timestamp), { addSuffix: true })}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className={`
            text-base font-semibold
            ${transaction.transaction_type === 'sent' 
              ? 'text-primary dark:text-primary-light' 
              : transaction.transaction_type === 'received'
                ? 'text-secondary dark:text-secondary-light'
                : 'text-accent dark:text-accent-light'
            }
          `}>
            {formatAmount(transaction)}
          </div>
          
          <Badge 
            variant="outline"
            className={`mt-2 text-xs ${
              transaction.status === 'completed' 
                ? 'bg-success/10 text-success border-success/20 dark:bg-success/20 dark:text-success-light' 
              : transaction.status === 'pending' 
                ? 'bg-warning/10 text-warning border-warning/20 dark:bg-warning/20 dark:text-warning-light' 
                : 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive-light'
            }`}
          >
            {transaction.status === 'completed' ? '✓ Completed' : 
             transaction.status === 'pending' ? '⏳ Pending' : '⚠ Failed'}
          </Badge>
          
          <ChevronRight size={16} className="text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
    
    if (isVirtualized) {
      // Simple div for virtualized list for better performance
      return (
        <div 
          className={baseClasses}
          onClick={() => handleRowClick(transaction)}
        >
          {transactionContent}
        </div>
      );
    }
      // Animated version for standard view (with optimized animations)
    return (
      <motion.div 
        className={baseClasses}
        onClick={() => handleRowClick(transaction)}
        // Use our optimized animation settings
        variants={getItemVariants(index)}
        initial="hidden"
        animate="visible"
        whileHover={shouldAnimate ? { scale: 0.995 } : {}}
        whileTap={shouldAnimate ? { scale: 0.98 } : {}}
      >
        {transactionContent}
      </motion.div>
    );
  }, [handleRowClick, formatAmount]);
  
  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
        <RefreshCw className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-gray-800 dark:text-white font-medium">No transactions yet</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-4">Transactions will appear here once you send or receive funds</p>
      <Button 
        onClick={() => navigate('/payments')}
        className="bg-primary hover:bg-primary-dark text-white"
        size="sm"
      >
        Send Money
      </Button>
    </div>
  );
  
  // Empty search state
  const EmptySearchState = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
        <Search className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-gray-800 dark:text-white font-medium">No matching transactions</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-3">Try adjusting your search terms</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setSearchTerm('')}
        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
      >
        Clear Search
      </Button>
    </div>
  );
    // Error state component
  const ErrorState = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 p-3 mb-3">
        <RefreshCw className="h-6 w-6 text-destructive dark:text-destructive-light" />
      </div>
      <p className="text-gray-800 dark:text-white font-medium">Unable to load transactions</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-4">Please check your connection and try again</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefresh}
        disabled={refreshing}
        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-primary dark:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-750"
      >
        <RefreshCw className={`h-3 w-3 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        Try Again
      </Button>
    </div>
  );
  
  // Load favorite transactions from local storage on mount
  useEffect(() => {
    const favorites = safeGetItem<string[]>('favoriteTransactions', []);
    setFavoriteTransactionIds(favorites);
  }, []);
    // Toggle favorite status for a transaction
  const handleToggleFavorite = useCallback((transactionId, isFavorite) => {
    setFavoriteTransactionIds(prev => {
      let newFavorites;
      if (isFavorite) {
        newFavorites = [...prev, transactionId];
      } else {
        newFavorites = prev.filter(id => id !== transactionId);
      }
      
      // Save to local storage using safe method
      safeSetItem('favoriteTransactions', newFavorites);
      return newFavorites;
    });
    
    // Provide haptic feedback
    hapticFeedback(isFavorite ? 'success' : 'medium');
  }, []);
    // Handle transaction delete action (hide transaction)
  // Handle transaction delete action (hide transaction)
  const handleDeleteTransaction = useCallback((transactionId) => {
    try {
      // For this implementation, we'll just hide it from view rather than delete it
      const hiddenTransactions = safeGetItem<string[]>('hiddenTransactions', []);
      
      const updatedHiddenTransactions = [...hiddenTransactions, transactionId];
      safeSetItem('hiddenTransactions', updatedHiddenTransactions);
      
      // Remove from favorites if it was there
      if (favoriteTransactionIds.includes(transactionId)) {
        handleToggleFavorite(transactionId, false);
      }
      
      // Force refresh to update the UI
      refetch();
      
      // Provide haptic feedback
      hapticFeedback('error');
    } catch (error) {
      console.error('Failed to hide transaction', error);
      // Still refresh UI to avoid inconsistent state
      refetch();
    }  }, [favoriteTransactionIds, refetch, handleToggleFavorite]);
  
  // Load grouped view preference
  useEffect(() => {
    // Use safe storage utility to get preference with a default value
    const savedPreference = safeGetItem('transactionGroupedView', false);
    
    // On low-end devices, enforce non-grouped view for better performance
    if (isMobile && isLowEndDevice) {
      setGroupedView(false);
    } else {
      setGroupedView(savedPreference);
    }
  }, [isMobile, isLowEndDevice]);
  
  // Toggle grouped view
  const toggleGroupedView = useCallback(() => {
    if (trackInteractionStart) trackInteractionStart();
    
    setGroupedView(prev => {
      const newValue = !prev;
      
      // Save preference using safe storage utility
      safeSetItem('transactionGroupedView', newValue);
      
      hapticFeedback('light');
      if (trackInteractionEnd) {
        setTimeout(() => trackInteractionEnd(), 50); // Track after animation starts
      }
      return newValue;
    });
  }, [trackInteractionStart, trackInteractionEnd]);
  // Render transaction list content based on mobile state
  const renderTransactionList = () => {    if (isLoading) {
      // Check if we have cached data - if so, the data might load faster
      const { data: cachedData } = transactionCache.getTransactions('recent');
      const hasCachedData = !!(cachedData && cachedData.length > 0);
      
      // Use the enhanced smart skeleton that provides estimated loading times
      return (
        <SmartSkeleton 
          count={5}
          staggered={!isLowEndDevice && shouldAnimate}
          reduced={isDataSaverEnabled || isLowEndDevice}
          isCached={hasCachedData}
          showEstimate={!isLowEndDevice}
          className="px-4"
        />
      );
    }
    
    if (error) {
      return <ErrorState />;
    }
    
    if (searchTerm && (!filteredTransactions || filteredTransactions.length === 0)) {
      return <EmptySearchState />;
    }
    
    if (!displayTransactions || displayTransactions.length === 0) {
      return <EmptyState />;
    }
    
    // Filter out hidden transactions
    let visibleTransactions = displayTransactions;
    const hiddenIds = safeGetItem<string[]>('hiddenTransactions', []);
    if (hiddenIds.length > 0) {
      visibleTransactions = displayTransactions.filter(t => !hiddenIds.includes(t.id));
    }
    
    // Performance optimization for large transaction lists
    const isLargeList = visibleTransactions.length > 50;
    
    // For mobile view, use enhanced transaction list with swipe actions and optional grouping
    if (isMobile) {
      // Group transactions if groupedView is enabled
      const transactionsToUse = groupedView 
        ? groupTransactionsByDate(visibleTransactions) 
        : visibleTransactions;
      
      // Wrap in a memo component for better performance with large lists
      return (
        <React.Suspense fallback={<div className="p-4">Loading transactions...</div>}>
          <TransactionList
            transactions={transactionsToUse}
            formatAmount={formatAmount}
            onSelectTransaction={handleRowClick}
            groupedByDate={groupedView}
            favoriteIds={favoriteTransactionIds}
            onToggleFavorite={handleToggleFavorite}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </React.Suspense>
      );
    }
    
    // Standard list for desktop view with animations
    // For larger lists, we'll use window-based rendering to improve performance
    if (isLargeList) {
      return (
        <VirtualizedList
          items={visibleTransactions}
          itemHeight={110}
          overscan={5}
          className="px-4 py-2"
          renderItem={(transaction, index, isVisible) => (
            <TransactionItem
              key={transaction.id || `transaction-${index}`}
              transaction={transaction}
              index={index}
              isVirtualized={true}
            />
          )}
          itemKey={(transaction: any) => transaction.id || `transaction-${transaction.created_at || Date.now()}`}
          onEndReached={loadMoreTransactions}
          endReachedThreshold={300}
          emptyState={<EmptyState />}
        />
      );
    }
    
    // For smaller lists, use standard rendering with animations
    return (
      <motion.div 
        className="px-4 py-2 divide-y divide-gray-100 dark:divide-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {visibleTransactions.map((transaction, index) => (
          <TransactionItem
            key={transaction.id || `transaction-${index}`}
            transaction={transaction}
            index={index}
          />
        ))}
        {/* Show performance metrics in development only */}
        {process.env.NODE_ENV === 'development' && lastRenderTime !== null && (
          <div className="text-xs text-gray-400 text-right pt-2">
            Render time: {Math.round(lastRenderTime)}ms | Avg: {averageRenderTime ? Math.round(averageRenderTime) : 0}ms | {visibleTransactions.length} items
          </div>
        )}
      </motion.div>
    );
  };
  // Prefetch transaction images when connection is good
  useEffect(() => {
    // Don't prefetch if:
    // - No transactions to prefetch
    // - Data saver is enabled
    // - Poor connection quality
    // - Low-end device
    // - Not on mobile (desktop browsers handle this differently)
    if (
      !transactions || 
      isDataSaverEnabled || 
      !hasGoodConnection() || 
      isLowEndDevice ||
      !isMobile
    ) return;
    
    // Extract avatar images, prioritizing favorites and recent transactions
    const priorityAvatars = () => {
      // Get favorite transactions first
      const favoriteTransactions = transactions.filter(t => 
        favoriteTransactionIds.includes(t.id)
      ).slice(0, 5); // Limit to top favorites
      
      // Get recent transactions (excluding favorites to avoid duplicates)
      const recentTransactions = transactions
        .filter(t => !favoriteTransactionIds.includes(t.id)) // Exclude favorites
        .slice(0, 10); // Just the most recent ones
        
      // Combine and extract avatars
      return [...favoriteTransactions, ...recentTransactions]
        .filter(t => t.recipient_avatar || t.sender_avatar)
        .map(t => t.recipient_avatar || t.sender_avatar)
        .filter(Boolean);
    };
    
    const avatarUrls = priorityAvatars();
    if (avatarUrls.length === 0) return;
    
    // Prefetch avatars with low priority
    const abortPrefetch = prefetchResources(avatarUrls, {
      lowPriority: true,
      skipIfSaveData: true,
      timeout: isLowEndDevice ? 5000 : 10000 // Lower timeout for low-end devices
    });
    
    // Clean up prefetch on component unmount
    return () => {
      abortPrefetch();
    };
  }, [transactions, isMobile, favoriteTransactionIds, isDataSaverEnabled, isLowEndDevice]);
  
  // Monitor online/offline status
  useEffect(() => {
    setIsOffline(!isOnline);
    
    // If we've gone from offline to online, attempt reconnection
    if (isOnline && isOffline) {
      handleReconnect();
    }
  }, [isOnline, isOffline]);
  
  // Handle reconnection attempts
  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await refetch();
      // Update last sync time on successful reconnection
      setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Failed to reconnect:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  // Cache transactions for offline support
  useEffect(() => {
    if (transactions && transactions.length > 0 && !isLoading && !error) {
      // Store transactions in cache with timestamp
      transactionCache.storeTransactions('recent', transactions);
      // Update last sync time
      setLastSyncTime(Date.now());
    }
  }, [transactions, isLoading, error]);
  
  // Load cached transactions when offline
  useEffect(() => {
    if (isOffline && !transactions) {
      // Try to load transactions from cache
      const { data: cachedData, timestamp } = transactionCache.getTransactions('recent');
      
      if (cachedData && cachedData.length > 0) {
        setLastSyncTime(timestamp);
      }
    }
  }, [isOffline, transactions]);
  
  return (
    <>
      <Card className="col-span-2 border-none shadow-lg bg-gradient-to-br from-surface-light to-surface-light/80 dark:from-surface-dark dark:to-surface-dark/90 backdrop-blur-sm overflow-hidden">        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</CardTitle>
          <div className="flex space-x-2">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleGroupedView}
                className={`relative ${groupedView ? 'text-primary dark:text-primary-light' : 'text-gray-500 dark:text-gray-400'} hover:text-primary hover:bg-primary/10 dark:hover:text-primary-light`}
                title="Group by date"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="relative text-gray-500 hover:text-primary hover:bg-primary/10 dark:text-gray-400 dark:hover:text-primary-light"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={isLoading || refreshing} 
              className="relative text-gray-500 hover:text-primary hover:bg-primary/10 dark:text-gray-400 dark:hover:text-primary-light"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-light/30"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>          <CardContent className={`p-0 ${isMobile ? 'h-[calc(100vh-220px)]' : ''}`} ref={contentRef}>
          {/* Offline indicator */}
          {isOffline && (
            <AnimatePresence>
              <OfflineIndicator
                lastSyncTime={lastSyncTime}
                onRetry={handleReconnect}
                hasOfflineData={!!transactions && transactions.length > 0}
                isReconnecting={isReconnecting}
                className="mx-4 mt-2"
              />
            </AnimatePresence>
          )}
          
          {renderTransactionList()}
          
          {/* Pull to Refresh Indicator */}
          {isMobile && (
            <PullToRefreshIndicator 
              pullProgress={pullProgress}
              isRefreshing={refreshing}
            />
          )}
          
          {/* Performance metrics display (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 pt-2">
              <div className="flex items-center justify-between">
                <PerformanceInfo className="ml-2" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <TransactionDetail
            transaction={selectedTransaction}
            isOpen={!!selectedTransaction}
            onClose={closeTransactionDetail}
          />
        )}
      </AnimatePresence>
    </>
  );
}
