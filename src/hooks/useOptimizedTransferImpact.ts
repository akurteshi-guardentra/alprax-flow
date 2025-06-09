
import { useState, useEffect, useMemo } from 'react';
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

// Throttle function for better performance
const throttle = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let lastCall = 0;
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    if (now - lastCall < delay) {
      return undefined;
    }
    lastCall = now;
    return func(...args);
  };
};

export function useOptimizedTransferImpact() {
  const [stats, setStats] = useState<TransferImpactStats>({
    totalFeeSaved: 0,
    totalTimeSaved: 0,
    totalCarbonSaved: 0,
    transferCount: 0,
    averageFeeSavings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const { transactions } = useTransactions();

  // Fetch impact metrics with improved caching strategy
  const { data: impactMetrics } = useQuery({
    queryKey: ['transferImpactMetrics'],
    queryFn: async () => {
      // Skip data fetching if component is not visible
      if (!isVisible) return [];
      
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
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
    enabled: isVisible, // Only fetch when visible
  });

  // Throttled function to update visibility
  const updateVisibility = useMemo(
    () => throttle((visible: boolean) => {
      setIsVisible(visible);
    }, 200),
    []
  );

  // Set up visibility observer
  useEffect(() => {
    // Use IntersectionObserver to check if component is in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        updateVisibility(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('transfer-impact-container');
    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [updateVisibility]);

  // Optimized calculations using useMemo to prevent unnecessary recalculations
  useEffect(() => {
    if (transactions && isVisible) {
      setIsLoading(true);
      
      // Use setTimeout to defer heavy calculations off the main thread
      setTimeout(() => {
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
      }, 0);
    }
  }, [transactions, isVisible]);

  return { stats, isLoading, impactMetrics, isVisible };
}
