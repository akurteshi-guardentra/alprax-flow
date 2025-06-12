
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEnhancedTransactionHistory } from "@/services/stellar/history";
import { useStellarAccount } from "./useStellarAccount";
import { toast } from "sonner";
import { useTransactionSubmission } from './useTransactionSubmission';

export function useTransactionHistory() {
  const queryClient = useQueryClient();
  const { publicKey } = useStellarAccount(); // Use publicKey instead of account
  const { fiatRate, defaultFiat } = useTransactionSubmission();
    const {
    data: transactions,
    isLoading,
    error,
    refetch: refreshTransactions
  } = useQuery({
    queryKey: ["transaction-history", publicKey],
    queryFn: async () => {
      if (!publicKey) {
        return Promise.resolve([]);
      }
      
      console.log("Fetching transaction history for:", publicKey);
      try {
        return await getEnhancedTransactionHistory(publicKey);
      } catch (error) {
        console.error("Error in transaction history query:", error);
        // Return empty array instead of throwing to avoid breaking UI
        return [];
      }
    },
    enabled: !!publicKey,
    // Refresh transaction data regularly
    refetchInterval: 15000, // Refresh every 15 seconds
    refetchIntervalInBackground: false, // Only refetch when tab is focused
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: 2, // Retry failed queries twice
    retryDelay: 1000, // Wait 1 second between retries
  });
  
  // Check for and handle errors
  if (error) {
    console.error("Error fetching transaction history:", error);
    toast.error("Failed to load transaction history");
  }
    // Define a more robust refetch function
  const refetch = () => {
    console.log("Manually refreshing transaction history");
    toast.info("Refreshing transaction history...");
    
    // Invalidate related queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
    queryClient.invalidateQueries({ queryKey: ["stellar-balance"] });
    
    // Call the refetch function returned by useQuery
    return refreshTransactions();
  };

  return {
    transactions: transactions || [],
    isLoading,
    error: error ? true : false,
    refetch,
    fiatRate,
    defaultFiat
  };
}
