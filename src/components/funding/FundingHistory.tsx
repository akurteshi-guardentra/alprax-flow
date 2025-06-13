
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FundingTransaction {
  id: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  fees: number;
}

const mockFundingHistory: FundingTransaction[] = [
  {
    id: '1',
    amount: 100,
    method: 'Credit Card',
    status: 'completed',
    date: '2024-01-15T10:30:00Z',
    fees: 3.20
  },
  {
    id: '2',
    amount: 50,
    method: 'Bank Transfer',
    status: 'pending',
    date: '2024-01-14T15:45:00Z',
    fees: 0.25
  },
  {
    id: '3',
    amount: 200,
    method: 'Crypto Wallet',
    status: 'completed',
    date: '2024-01-13T09:15:00Z',
    fees: 2.50
  }
];

export function FundingHistory() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Card className="glass-card modern-shadow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Recent Funding Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockFundingHistory.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(transaction.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">${transaction.amount.toFixed(2)}</p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="text-white/60 text-sm">
                    {transaction.method} • Fee: ${transaction.fees.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
                <p className="text-white/50 text-xs">
                  {new Date(transaction.date).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {mockFundingHistory.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">No funding history yet</p>
            <p className="text-white/40 text-sm">Your funding transactions will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
