import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TransactionTimeline } from './TransactionTimeline';
import { format, formatRelative } from 'date-fns';
import { ExternalLink, ArrowDownLeft, ArrowUpRight, Star, Copy, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';
import { useTransactionSubmission } from '@/hooks/useTransactionSubmission'; // Import for fiat rate
import { CurrencySymbol } from "@/components/CurrencyDisplay"; // Import CurrencySymbol

interface TransactionDetailProps {
  transaction: any;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetail({ transaction, isOpen, onClose }: TransactionDetailProps) {
  const { fiatRate, defaultFiat } = useTransactionSubmission(); // Get fiat rate and default currency
  const [copied, setCopied] = React.useState(false);
  
  if (!transaction) return null;
  
  // Format the transaction date nicely
  const formattedDate = formatRelative(new Date(transaction.timestamp || transaction.created_at), new Date());
  const exactDate = format(new Date(transaction.timestamp || transaction.created_at), 'PPP pp');
  
  // Determine transaction type for the timeline view
  const transactionType = transaction.transaction_type || 
    (transaction.from === 'me' ? 'sent' : 'received');
    
  // Create timeline events if they don't exist
  const timeline = transaction.timeline || [
    { status: 'initiated', timestamp: transaction.timestamp || transaction.created_at },
    ...(transaction.status === 'completed' ? [{ status: 'completed', timestamp: transaction.timestamp || transaction.created_at }] : []),
  ];
    // Generate a view URL for transaction details (using Stellar Explorer behind the scenes)
  const transactionDetailsUrl = transaction.hash ? 
    `https://stellar.expert/explorer/testnet/tx/${transaction.hash}` : null;
    
  // Format transaction amount with plus/minus sign and styling
  const fiatAmount = (parseFloat(transaction.amount) * fiatRate).toFixed(2);
  const formattedAmount = `${transactionType === 'sent' ? '-' : '+'} ${fiatAmount} ${defaultFiat}`;
  
  // Get appropriate transaction icon
  const TransactionIcon = 
    transactionType === 'sent' ? ArrowUpRight :
    transactionType === 'received' ? ArrowDownLeft : Star;
    
  // Determine sender and recipient information based on transaction type
  const senderInfo = useMemo(() => {
    if (transactionType === 'received') {
      return {
        name: transaction.recipient_name || 'Sender',
        address: transaction.from_address || ''
      };
    } else {
      return {
        name: 'My Account',
        address: transaction.from_address || ''
      };
    }
  }, [transaction, transactionType]);
  
  const recipientInfo = useMemo(() => {
    if (transactionType === 'sent') {
      return {
        name: transaction.recipient_name || 'Recipient',
        address: transaction.to_address || ''
      };
    } else {
      return {
        name: 'My Account',
        address: transaction.to_address || ''
      };
    }
  }, [transaction, transactionType]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Transaction hash copied to clipboard");
    hapticFeedback("light");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center">
            <TransactionIcon className={`h-5 w-5 mr-2 ${
              transactionType === 'sent' ? 'text-blue-500' : 
              transactionType === 'received' ? 'text-green-500' : 'text-yellow-500'
            }`} />
            {transactionType === 'sent' ? 'Payment Sent' : 
             transactionType === 'received' ? 'Payment Received' : 
             transactionType === 'funding' ? 'Account Funding' : 
             'Transaction Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* Transaction status with time */}
          <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
            <div className="flex items-center">
              {transaction.status === 'completed' ? (
                <div className="bg-green-500/20 p-1.5 rounded-full mr-3">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
              ) : (
                <div className="bg-yellow-500/20 p-1.5 rounded-full mr-3">
                  <Clock className="h-4 w-4 text-yellow-400" />
                </div>
              )}
              <div>
                <div className="font-medium text-white">
                  {transaction.status === 'completed' ? 'Completed' : 'Processing'}
                </div>
                <div className="text-xs text-white/60">{exactDate}</div>
              </div>
            </div>
            
            <Badge 
              className={`${
                transaction.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {transaction.status || 'unknown'}
            </Badge>
          </div>
          
          <Separator className="bg-white/10" />
          
          {/* Transaction amount */}
          <div className="text-center py-3">
            <div className={`text-3xl font-bold ${
              transactionType === 'sent' ? 'text-blue-400' :
              transactionType === 'received' ? 'text-green-400' :
              'text-yellow-400'
            }`}>
              {formattedAmount}
            </div>
            {transaction.equivalent_fiat && (
              <div className="text-white/60 text-sm mt-1">
                {/* This can be removed or kept if it's a different fiat value */}
                {/* ≈ {transaction.equivalent_fiat} */}
              </div>
            )}
          </div>
          
          {/* From/To section */}
          <div className="bg-slate-700/30 rounded-lg p-3 space-y-3">
            <div>
              <div className="text-sm text-white/70">From</div>
              <div className="flex justify-between items-center mt-1">
                <div className="font-medium text-white">{senderInfo.name}</div>
                <div className="text-xs text-white/60 truncate max-w-[180px]">
                  {senderInfo.address.substring(0, 8)}...{senderInfo.address.substring(senderInfo.address.length - 4)}
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-white/70">To</div>
              <div className="flex justify-between items-center mt-1">
                <div className="font-medium text-white">{recipientInfo.name}</div>
                <div className="text-xs text-white/60 truncate max-w-[180px]">
                  {recipientInfo.address.substring(0, 8)}...{recipientInfo.address.substring(recipientInfo.address.length - 4)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional metadata */}
          <div className="space-y-2">
            {transaction.memo && (
              <div className="bg-slate-700/30 p-3 rounded-lg">
                <div className="text-sm text-white/70">Memo</div>
                <div className="text-white mt-1">{transaction.memo}</div>
              </div>
            )}
            
            {/* Show purpose, category, country if available */}
            {(transaction.transfer_purpose || transaction.transfer_category || transaction.recipient_country) && (
              <div className="bg-slate-700/30 p-3 rounded-lg space-y-2">
                {transaction.transfer_purpose && (
                  <div>
                    <div className="text-sm text-white/70">Purpose</div>
                    <div className="text-white">{transaction.transfer_purpose}</div>
                  </div>
                )}
                {transaction.transfer_category && (
                  <div>
                    <div className="text-sm text-white/70">Category</div>
                    <div className="text-white">{transaction.transfer_category}</div>
                  </div>
                )}
                {transaction.recipient_country && (
                  <div>
                    <div className="text-sm text-white/70">Country</div>
                    <div className="text-white">{transaction.recipient_country}</div>
                  </div>
                )}
              </div>
            )}
          </div>
            {/* Transaction reference with copy */}
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-white/70 mb-1">Transaction Reference</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/60 font-mono truncate pr-2">
                {transaction.hash ? `REF-${transaction.hash.substring(0, 8)}` : 'Not available'}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => transaction.hash && copyToClipboard(`REF-${transaction.hash.substring(0, 8)}`)}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
          
          {/* Transaction timeline */}
          <div>
            <div className="text-sm text-white/70 mb-2">Transaction Timeline</div>
            <div className="bg-slate-700/30 p-3 rounded-lg">
              <TransactionTimeline events={timeline} />
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end mt-4">          {transactionDetailsUrl && (
            <Button 
              variant="outline" 
              className="bg-blue-800/50 border-blue-700 text-blue-300 hover:bg-blue-800"
              onClick={() => window.open(transactionDetailsUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Transaction Details
            </Button>
          )}
          <Button 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
            onClick={onClose}
            autoFocus
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
