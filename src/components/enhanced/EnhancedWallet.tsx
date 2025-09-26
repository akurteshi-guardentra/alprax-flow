import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StellarAddressDisplay } from '@/components/ui/StellarAddressDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
import { getBalance } from '@/lib/stellar';
import { formatBalance } from '@/utils/stellar-display';
import { getCopy } from '@/lib/constants/copy';
import { 
  Wallet, 
  TrendingUp, 
  Send, 
  Download, 
  History, 
  PieChart,
  Shield,
  Settings,
  Star,
  Clock
} from 'lucide-react';

interface WalletBalance {
  asset: string;
  balance: string;
  value?: number;
  change24h?: number;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  asset: string;
  to?: string;
  from?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface EnhancedWalletProps {
  publicKey: string;
  onSend?: () => void;
  onReceive?: () => void;
}

export function EnhancedWallet({ publicKey, onSend, onReceive }: EnhancedWalletProps) {
  const isMobile = useIsMobile();
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [change24h, setChange24h] = useState(0);

  useEffect(() => {
    loadWalletData();
  }, [publicKey]);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const stellarBalances = await getBalance(publicKey);
      
      // Transform to enhanced format with mock data for now
      const enhancedBalances: WalletBalance[] = stellarBalances.map(balance => ({
        asset: balance.asset,
        balance: balance.balance,
        value: balance.asset === 'XLM' ? parseFloat(balance.balance) * 0.12 : 0, // Mock XLM price
        change24h: Math.random() * 10 - 5 // Mock 24h change
      }));
      
      setBalances(enhancedBalances);
      
      // Calculate total portfolio value
      const total = enhancedBalances.reduce((sum, bal) => sum + (bal.value || 0), 0);
      setTotalValue(total);
      setChange24h(Math.random() * 10 - 5); // Mock portfolio change
      
      // Mock transaction data - in real app, fetch from Stellar network
      setTransactions([
        {
          id: '1',
          type: 'received',
          amount: '100.00',
          asset: 'XLM',
          from: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'sent',
          amount: '50.00',
          asset: 'XLM',
          to: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'completed'
        }
      ]);
      
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAssetIcon = (asset: string) => {
    switch (asset) {
      case 'XLM':
        return '⭐';
      default:
        return '💎';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded" />
            <div className="h-40 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Portfolio Overview */}
      <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{getCopy('WALLET', 'portfolio')}</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-foreground">
                ${totalValue.toFixed(2)} USD
              </div>
              <div className={`text-sm flex items-center space-x-1 ${
                change24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="h-3 w-3" />
                <span>{change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}% (24h)</span>
              </div>
            </div>
            
            <StellarAddressDisplay 
              address={publicKey} 
              mode="card"
            />
            
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2`}>
              <Button onClick={onSend} className="mobile-button-primary">
                <Send className="h-4 w-4 mr-2" />
                {getCopy('ACTIONS', 'send')}
              </Button>
              <Button onClick={onReceive} variant="secondary" className="mobile-button-secondary">
                <Download className="h-4 w-4 mr-2" />
                {getCopy('ACTIONS', 'receive')}
              </Button>
              {!isMobile && (
                <>
                  <Button variant="outline">
                    <PieChart className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Content */}
      <Tabs defaultValue="balances" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="transactions">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-4">
          {balances.map((balance, index) => (
            <Card key={index} className="mobile-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getAssetIcon(balance.asset)}</div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {formatBalance(balance.balance, balance.asset)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${(balance.value || 0).toFixed(2)} USD
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${
                      (balance.change24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(balance.change24h || 0) >= 0 ? '+' : ''}{(balance.change24h || 0).toFixed(2)}%
                    </div>
                    <Button variant="ghost" size="sm">
                      <Star className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {transactions.map((tx) => (
            <Card key={tx.id} className="mobile-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'sent' ? 'bg-red-500/20' : 'bg-green-500/20'
                    }`}>
                      {tx.type === 'sent' ? 
                        <Send className="h-4 w-4 text-red-600" /> : 
                        <Download className="h-4 w-4 text-green-600" />
                      }
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {tx.type === 'sent' ? 'Sent' : 'Received'} {tx.asset}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {tx.type === 'sent' ? '-' : '+'}{formatBalance(tx.amount, tx.asset)}
                    </div>
                    <Badge className={getStatusColor(tx.status)}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-base">Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Portfolio Growth</span>
                  <span>+12.5%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>XLM Holdings</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex justify-between">
                    <span>Total Transactions:</span>
                    <span>247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span>99.6%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Amount:</span>
                    <span>75.2 XLM</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}