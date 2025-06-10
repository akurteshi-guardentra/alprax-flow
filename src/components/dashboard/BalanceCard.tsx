
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { FiatDisplay } from "@/components/currency/FiatDisplay";
import { useStellarAccount } from "@/hooks/useStellarAccount";

export function BalanceCard() {
  const navigate = useNavigate();
  const { balance } = useStellarAccount();

  // Get the first balance entry (typically XLM) or default to "0"
  const accountBalance = balance && balance.length > 0 ? balance[0].balance : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <ModernCard variant="glass" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
        <ModernCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-2">Available Balance</p>
              <div className="text-3xl font-bold text-white">
                <FiatDisplay 
                  xlmAmount={accountBalance} 
                  currency="USD"
                />
              </div>
              <p className="text-white/60 text-sm mt-1">
                Alprax Flow Account
              </p>
            </div>
            <div className="text-right">
              <Button
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-none"
                onClick={() => navigate("/add-funds")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </motion.div>
  );
}
