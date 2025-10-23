
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { FiatDisplay } from "@/components/currency/FiatDisplay";
import { useUserAccount } from "@/hooks/useUserAccount";
import { useState } from "react";

export function BalanceCard() {
  const navigate = useNavigate();
  const { balance, currency } = useUserAccount();
  const [showBalance, setShowBalance] = useState(true);

  // Get balance value
  const balanceValue = balance || 0;
  
  // Determine balance status for better UX
  const getBalanceStatus = () => {
    if (balanceValue === 0) return { status: "empty", message: "Add funds to get started", color: "text-orange-300" };
    if (balanceValue < 10) return { status: "low", message: "Consider adding more funds", color: "text-yellow-300" };
    if (balanceValue < 50) return { status: "moderate", message: "Good for small transactions", color: "text-blue-300" };
    return { status: "healthy", message: "Great balance for all transactions", color: "text-green-300" };
  };

  const balanceStatus = getBalanceStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8 w-full"
    >
      <ModernCard variant="glass" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 relative overflow-hidden">
        <ModernCardContent className="p-6">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-white/70 text-sm">Available Balance</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1 h-auto text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-3xl font-bold text-white">
                    {showBalance ? (
                      <span>{currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}{balanceValue.toFixed(2)}</span>
                    ) : (
                      <span className="text-white/60">••••••</span>
                    )}
                  </div>
                  {showBalance && balanceValue > 0 && (
                    <div className="flex items-center gap-1 text-sm text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>Active</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <p className="text-white/60 text-sm">Alprax Flow Account</p>
                  {balanceStatus.status !== "healthy" && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-orange-400" />
                    </div>
                  )}
                </div>
                
                {/* Balance status message */}
                <p className={`text-xs mt-1 ${balanceStatus.color}`}>
                  {balanceStatus.message}
                </p>
              </div>
              
              <div className="text-right space-y-2">
                <Button
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-none transition-all duration-300 hover:scale-105"
                  onClick={() => navigate("/add-funds")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
                
                {balanceValue > 0 && (
                  <div className="text-xs text-white/50">
                    Ready to send
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress bar for balance status - improved mobile layout */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-3 max-w-full overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  balanceStatus.status === "empty" ? "w-0 bg-gray-400" :
                  balanceStatus.status === "low" ? "w-1/4 bg-gradient-to-r from-orange-400 to-orange-500" :
                  balanceStatus.status === "moderate" ? "w-2/3 bg-gradient-to-r from-yellow-400 to-yellow-500" :
                  "w-full bg-gradient-to-r from-green-400 to-green-500"
                }`}
              ></div>
            </div>
            
            {/* Quick action hints - mobile responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-white/60">
              <span className="text-center sm:text-left">
                {balanceValue === 0 ? "Fund your account to start sending money" :
                 balanceValue < 10 ? "Low balance - add funds for better experience" :
                 "Ready for all transactions"}
              </span>
              <span className="flex items-center justify-center sm:justify-end gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="whitespace-nowrap">Secure & Protected</span>
              </span>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </motion.div>
  );
}
