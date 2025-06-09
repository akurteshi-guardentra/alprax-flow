
import { useState, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TransferImpactStats {
  totalFeeSaved: number;
  totalTimeSaved: number;
  totalCarbonSaved: number;
  transferCount: number;
  averageFeeSavings: number;
}

interface ImpactMetric {
  id: string;
  created_at: string;
  fees_saved: number;
  traditional_fee_estimate: number;
  processing_time_saved: number;
  carbon_footprint_saved: number;
}

export function useTransferImpact() {
  const [stats, setStats] = useState<TransferImpactStats>({
    totalFeeSaved: 0,
    totalTimeSaved: 0,
    totalCarbonSaved: 0,
    transferCount: 0,
    averageFeeSavings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { transactions } = useTransactions();

  // Fetch impact metrics from the database
  const { data: impactMetrics } = useQuery({
    queryKey: ['transferImpactMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfer_impact_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching transfer impact metrics:', error);
        return [];
      }
      
      return data as ImpactMetric[];
    },
    initialData: [],
  });

  useEffect(() => {
    if (transactions) {
      setIsLoading(true);
      
      // Filter for expense type transactions (transfers)
      const transferTransactions = transactions.filter(tx => tx.type === 'expense');
      
      // Calculate environmental and financial impact metrics
      let feeSavings = 0;
      let timeSaved = 0;
      let carbonSaved = 0;
      
      transferTransactions.forEach(transaction => {
        // Calculate fee savings (traditional banking fees are typically 3-5%)
        const traditionalFeePercent = 0.045; // 4.5%
        const alpraxFeePercent = 0.01; // 1%
        
        const traditionalFee = transaction.amount * traditionalFeePercent;
        const alpraxFee = transaction.amount * alpraxFeePercent;
        const individualFeeSaved = traditionalFee - alpraxFee;
        
        feeSavings += individualFeeSaved;
        
        // Each transaction saves approximately 20-60 minutes compared to traditional methods
        timeSaved += Math.floor(20 + Math.random() * 40);
        
        // Carbon footprint savings - blockchain vs traditional banking
        // Studies suggest each traditional banking transaction produces ~3.5kg CO2
        // While blockchain transactions are much more efficient
        const traditionalCarbonKg = 3.5;
        const blockchainCarbonKg = 0.3;
        carbonSaved += (traditionalCarbonKg - blockchainCarbonKg);
      });
      
      const transferCount = transferTransactions.length;
      const averageFeeSavings = transferCount > 0 ? feeSavings / transferCount : 0;
      
      setStats({
        totalFeeSaved: feeSavings,
        totalTimeSaved: timeSaved,
        totalCarbonSaved: carbonSaved,
        transferCount: transferCount,
        averageFeeSavings: averageFeeSavings
      });
      
      setIsLoading(false);
    }
  }, [transactions]);

  return { stats, isLoading, impactMetrics };
}
