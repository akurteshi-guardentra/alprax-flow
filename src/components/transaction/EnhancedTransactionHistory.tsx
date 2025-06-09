// Enhanced transaction history with human-readable recipient information
import { useState, useEffect } from "react";
import { CalendarDays, Clock, Mail, User, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StellarService } from '@/services/stellar';
import type { TransactionWithAccount, TransactionStatus } from '@/services/stellar/types';
import { formatDistanceToNow } from 'date-fns';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';

interface EnhancedTransactionHistoryProps {
  publicKey: string;
}

export function EnhancedTransactionHistory({ publicKey }: EnhancedTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<TransactionWithAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { fiatRate, defaultFiat } = useTransactionHistory();
  // Format amount in fiat currency
  const formatAmount = (networkAmount: string) => {
    const amount = parseFloat(networkAmount);
    if (fiatRate && fiatRate > 0) {
      const fiatAmount = amount * fiatRate;
      return `${fiatAmount.toFixed(2)} ${defaultFiat}`;
    }
    // If rate not available, show amount in default currency with loading indicator
    return `${amount.toFixed(2)} ${defaultFiat}`;
  };
  
  // Fetch transaction history on component mount and when publicKey changes
  useEffect(() => {
    async function fetchTransactions() {
      setIsLoading(true);
      setError(null);
      try {
        const history = await StellarService.getEnhancedTransactionHistory(publicKey);
        setTransactions(history);
      } catch (err) {
        console.error("Failed to load transaction history:", err);
        setError("Failed to load transaction history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (publicKey) {
      fetchTransactions();
    }
  }, [publicKey]);

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(tx => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    return (
      tx.recipient_name?.toLowerCase().includes(term) ||
      tx.hash?.toLowerCase().includes(term) ||
      tx.memo?.toLowerCase().includes(term) ||
      tx.amount?.toString().includes(term)
    );
  });

  // Handle manual refresh
  const handleRefresh = () => {
    if (publicKey) {
      setIsLoading(true);
      setError(null);
      StellarService.getEnhancedTransactionHistory(publicKey)
        .then(history => {
          setTransactions(history);
        })
        .catch(err => {
          console.error("Failed to refresh transaction history:", err);
          setError("Failed to refresh. Please try again.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // Format transaction status badge
  const getStatusBadge = (status: string, type: string) => {
    let className = "";
    let label = status;
    
    switch (status) {
      case "completed":
        className = "bg-green-500/20 text-green-300 border-green-500/30";
        label = type === "received" ? "Received" : "Sent";
        break;
      case "pending":
        className = "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
        break;
      case "failed":
        className = "bg-red-500/20 text-red-300 border-red-500/30";
        break;
      case "initiated":
        className = "bg-blue-500/20 text-blue-300 border-blue-500/30";
        label = "Processing";
        break;
      case "funding":
        className = "bg-purple-500/20 text-purple-300 border-purple-500/30";
        label = "Account Funded";
        break;
      default:
        className = "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
    
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // Format transaction time relative to now
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "Unknown time";
    }
  };

  // Render transaction loading skeletons
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <div key={i} className="p-4 border border-white/10 rounded-lg bg-white/5">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 bg-white/10" />
            <Skeleton className="h-4 w-48 bg-white/10" />
          </div>
          <Skeleton className="h-6 w-20 bg-white/10" />
        </div>
      </div>
    ));
  };

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-white">Transaction History</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/60"
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-3">{renderSkeletons()}</div>
        ) : error ? (
          <div className="text-center p-6">
            <p className="text-red-300 mb-2">{error}</p>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              Try Again
            </Button>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredTransactions.map(tx => (
              <div key={tx.id} className="p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(tx.status, tx.transaction_type)}                      <h4 className={`font-medium ${tx.transaction_type === 'received' ? 'text-green-300' : 'text-white'}`}>
                        {tx.transaction_type === 'received' ? 'Received' : 'Sent'} {formatAmount(tx.amount)}
                      </h4>
                    </div>
                    
                    <div className="space-y-1 mt-2">
                      {tx.transaction_type !== 'funding' && (
                        <div className="flex items-center text-white/70 text-sm">
                          <User className="h-3.5 w-3.5 mr-1.5 text-white/50" />
                          {tx.transaction_type === 'received' ? 'From: ' : 'To: '}
                          <span className="font-medium ml-1">{tx.recipient_name || 'Unknown'}</span>
                        </div>
                      )}
                      
                      {tx.memo && (
                        <div className="flex items-center text-white/70 text-sm">
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-white/50" />
                          {tx.memo}
                        </div>
                      )}
                      
                      <div className="flex items-center text-white/50 text-xs">
                        <CalendarDays className="h-3 w-3 mr-1.5" />
                        {new Date(tx.created_at).toLocaleDateString()}
                        <Clock className="h-3 w-3 ml-2 mr-1.5" />
                        {formatTime(tx.created_at)}
                      </div>
                    </div>
                  </div>
                    <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-white/50 hover:text-white hover:bg-white/10"
                    onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${tx.hash}`, '_blank')}
                    aria-label="View transaction details"
                    title="View transaction details"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6">
            <p className="text-white/60 mb-2">
              {searchTerm ? "No transactions match your search" : "No transactions found"}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
