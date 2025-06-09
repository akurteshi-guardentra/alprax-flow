import React, { useState, useCallback, useEffect } from 'react';
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SwipeableTransactionItem } from "@/components/ui/swipeable-transaction-item";
import { Badge } from "@/components/ui/badge";
import { hapticFeedback } from "@/lib/haptics";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { TransactionAvatar } from "@/components/ui/transaction-avatar";
import { useLazyLoading } from "@/hooks/use-lazy-loading";

// Enhanced mobile-friendly transaction list with swipeable actions
export function TransactionList({
  transactions,
  formatAmount,
  onSelectTransaction,
  groupedByDate = false,
  favoriteIds = [],
  onToggleFavorite,
  onDeleteTransaction,
}) {
  // Animation variants for list items
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
      },
    }),
  };

  // Transaction item without swipe actions
  const StandardTransactionItem = ({ transaction, index }) => (
    <motion.div
      className="p-3 my-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
      custom={index}
      initial="hidden"
      animate="visible"
      variants={itemVariants}
    >
      <TransactionContent transaction={transaction} />
    </motion.div>
  );

  // Transaction item with swipe actions
  const SwipeableItem = ({ transaction, index }) => {
    const isFavorited = favoriteIds.includes(transaction.id);
    
    const handleFavorite = () => {
      hapticFeedback('medium');
      if (onToggleFavorite) {
        onToggleFavorite(transaction.id, !isFavorited);
      }
    };
    
    const handleDelete = () => {
      hapticFeedback('heavy');
      if (onDeleteTransaction) {
        onDeleteTransaction(transaction.id);
      }
    };
    
    return (
      <SwipeableTransactionItem
        onSelect={() => onSelectTransaction(transaction)}
        onFavorite={handleFavorite}
        onDelete={handleDelete}
        isFavorited={isFavorited}
      >
        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl">
          <TransactionContent transaction={transaction} />
        </div>
      </SwipeableTransactionItem>
    );
  };

  // Common transaction content component
  const TransactionContent = ({ transaction }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <TransactionIcon transaction={transaction} />
        
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {getTransactionTitle(transaction)}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {transaction.memo && <div className="truncate max-w-[200px]">{transaction.memo}</div>}
            {!transaction.memo && transaction.transfer_purpose && 
              <div className="truncate max-w-[200px]">{transaction.transfer_purpose}</div>}
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
        
        {favoriteIds.includes(transaction.id) && (
          <Star size={14} className="text-amber-400 mt-2" />
        )}
      </div>
    </div>
  );
  // Transaction icon based on type
  const TransactionIcon = ({ transaction }) => {
    const getIconClass = () => {
      if (transaction.transaction_type === 'sent') {
        return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light';
      } else if (transaction.transaction_type === 'received') {
        return 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-light';
      } else {
        return 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-light';
      }
    };    // If there's a profile picture, use the optimized TransactionAvatar
    if (transaction.recipient_avatar || transaction.sender_avatar) {
      const avatarSrc = transaction.transaction_type === 'sent' 
        ? transaction.recipient_avatar 
        : transaction.sender_avatar;
      
      const name = transaction.transaction_type === 'sent'
        ? transaction.recipient_name
        : transaction.sender_name;
      
      return (
        <TransactionAvatar
          src={avatarSrc}
          name={name || ''}
          type={transaction.transaction_type === 'sent' ? 'recipient' : 'sender'}
          size="md"
        />
      );
    }

    // Otherwise, use the standard icon
    return (
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center ${getIconClass()}
      `}>
        {getTransactionIcon(transaction)}
      </div>
    );
  };

  // Helper to get transaction title
  const getTransactionTitle = (transaction) => {
    if (transaction.transaction_type === 'sent') {
      return `Sent to ${transaction.recipient_name || "Contact"}`;
    } else if (transaction.transaction_type === 'received') {
      return `Received from ${transaction.recipient_name || "Contact"}`;
    } else if (transaction.transaction_type === 'funding') {
      return `Account Funding`;
    } else {
      return transaction.transaction_type || transaction.type;
    }
  };

  // Helper to get transaction icon
  const getTransactionIcon = (transaction) => {
    if (transaction.transaction_type === 'sent') {
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>;
    } else if (transaction.transaction_type === 'received') {
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 7 17 7 7"></polyline></svg>;
    } else {
      return <Star className="h-5 w-5" />;
    }
  };

  // Item renderer based on whether we use swipe actions
  const renderItem = useCallback((transaction, index) => {
    // Using our swipeable component for mobile
    return (
      <div key={transaction.id || `transaction-${index}`} className="mb-2">
        <SwipeableItem
          transaction={transaction}
          index={index}
        />
      </div>
    );
  }, [favoriteIds, onToggleFavorite, onDeleteTransaction, onSelectTransaction]);

  // Group header component
  const GroupHeader = ({ title }) => (
    <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-2 px-4 font-medium text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
      {title}
    </div>
  );
  // Loader indicator when more items are being loaded
  const LoadingIndicator = () => (
    <div className="flex justify-center py-4">
      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
  
  // Render as flat list
  if (!groupedByDate) {
    // For flat lists, we can use the useLazyLoading hook to improve performance
    const { visibleItems, loadingRef, hasMore } = useLazyLoading(transactions, {
      initialBatchSize: 15,
      batchIncrement: 10
    });
    
    return (
      <div className="px-4 py-2">
        {visibleItems.map((transaction, index) => renderItem(transaction, index))}
        
        {/* Loading indicator at bottom that triggers more items to load */}
        {hasMore && (
          <div ref={loadingRef} className="pb-2">
            <LoadingIndicator />
          </div>
        )}
      </div>
    );
  }

  // For grouped lists, we use a more sophisticated approach
  return (
    <div>
      {transactions.map((group, index) => (
        <div key={`group-${index}`}>
          <GroupHeader title={group.title} />
          <div className="px-4 py-2">
            {/* Limit the number of items initially visible in each group */}
            {group.data.slice(0, 20).map((transaction, i) => renderItem(transaction, i))}
            
            {/* Show 'View More' button if there are more than 20 items */}
            {group.data.length > 20 && (
              <button 
                className="w-full py-2 text-sm text-center text-primary dark:text-primary-light border-t border-gray-100 dark:border-gray-800 mt-2"
                onClick={() => {
                  // Scroll to the top of next group on expanding
                  const nextGroup = document.getElementById(`group-${index + 1}`);
                  if (nextGroup) {
                    nextGroup.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                View {group.data.length - 20} more transactions
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
