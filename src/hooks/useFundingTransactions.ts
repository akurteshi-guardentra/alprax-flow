
import { useQuery } from '@tanstack/react-query';
import { PaymentService, FundingTransaction } from '@/services/PaymentService';

export function useFundingTransactions() {
  const {
    data: transactions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['funding-transactions'],
    queryFn: () => PaymentService.getFundingTransactions(),
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000
  });

  return {
    transactions: transactions || [],
    isLoading,
    error: !!error,
    refetch
  };
}
