
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { motion } from "framer-motion";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { TransferImpact } from "@/components/financial/TransferImpact";
import { TransactionStatus } from "@/components/financial/TransactionStatus";
import { KYCStatus } from "@/components/kyc/KYCStatus";

export default function ModernDashboard() {
  const { isLoading } = useStellarAccount();

  if (isLoading) {
    return (
      <div className="min-h-screen modern-gradient flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center modern-shadow"
        >
          <div className="animate-modern-pulse space-y-4">
            <div className="h-8 bg-white/20 rounded-lg w-48 mx-auto shimmer-effect"></div>
            <div className="h-4 bg-white/15 rounded w-32 mx-auto shimmer-effect"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen modern-gradient relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-modern-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <DashboardHeader />
          
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Balance & Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <BalanceCard />
              <QuickActionsGrid />
              <RecentActivityCard />
            </div>
            
            {/* Right Column - Status Cards */}
            <div className="space-y-6">
              <KYCStatus compact={true} />
              <SecurityDashboard />
              <StatsGrid />
            </div>
          </div>

          {/* Bottom Section - Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <TransferImpact />
            <TransactionStatus />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
