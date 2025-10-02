import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Transaction {
  id: string;
  amount: number;
  created_at: string;
  transaction_type: string;
  status: string;
  recipient_name?: string;
  memo?: string;
}

export function ProfileTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('stellar_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'sent' ? (
      <ArrowUpRight className="h-5 w-5 text-red-400" />
    ) : (
      <ArrowDownRight className="h-5 w-5 text-green-400" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-white/70';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="glass-card p-8 text-center">
        <p className="text-white/70">No transactions yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Recent Transactions</h3>
      
      {transactions.map((tx) => (
        <Card key={tx.id} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTransactionIcon(tx.transaction_type)}
              <div>
                <p className="font-medium text-white">
                  {tx.transaction_type === 'sent' ? 'Sent to' : 'Received from'}{' '}
                  {tx.recipient_name || 'Unknown'}
                </p>
                <p className="text-sm text-white/70">
                  {new Date(tx.created_at).toLocaleDateString()}
                </p>
                {tx.memo && (
                  <p className="text-xs text-white/50 mt-1">{tx.memo}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${tx.transaction_type === 'sent' ? 'text-red-400' : 'text-green-400'}`}>
                {tx.transaction_type === 'sent' ? '-' : '+'}{tx.amount} XLM
              </p>
              <p className={`text-xs ${getStatusColor(tx.status)}`}>
                {tx.status}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
