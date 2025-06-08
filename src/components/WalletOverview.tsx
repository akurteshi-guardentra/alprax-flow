import { motion } from "framer-motion";
import { CurrencyCard } from "./CurrencyCard";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WalletBalance {
  currency: string;
  amount: number;
  change: number;
}

export function WalletOverview() {
  const { data: walletBalances, isLoading } = useQuery({
    queryKey: ['wallet-balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_balances')
        .select('*')
        .returns<WalletBalance[]>();

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white px-2">Wallet Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {walletBalances?.map((data, index) => (
          <motion.div
            key={data.currency}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <CurrencyCard {...data} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
