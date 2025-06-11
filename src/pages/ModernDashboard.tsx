
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { motion } from "framer-motion";
import { TransferImpact } from "@/components/financial/TransferImpact";
import { TransactionStatus } from "@/components/financial/TransactionStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Globe, Zap } from "lucide-react";

export default function ModernDashboard() {
  const { isLoading } = useStellarAccount();

  if (isLoading) {
    return (
      <div className="min-h-screen modern-gradient flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center modern-shadow-lg"
        >
          <div className="animate-modern-pulse space-y-6">
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto shimmer-effect"></div>
            <div className="h-8 bg-white/20 rounded-lg w-64 mx-auto shimmer-effect"></div>
            <div className="h-4 bg-white/15 rounded w-48 mx-auto shimmer-effect"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  const transactionMetrics = [
    {
      title: "Total Sent",
      value: "$12,450",
      icon: DollarSign,
      change: "+12%",
      period: "This month"
    },
    {
      title: "Countries Reached",
      value: "8",
      icon: Globe,
      change: "+2",
      period: "This quarter"
    },
    {
      title: "Avg. Transfer Time",
      value: "3.2s",
      icon: Zap,
      change: "-0.5s",
      period: "Last week"
    },
    {
      title: "Fees Saved",
      value: "$890",
      icon: TrendingUp,
      change: "+45%",
      period: "vs traditional banks"
    }
  ];

  return (
    <div className="min-h-screen modern-gradient relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-modern-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <DashboardHeader />
          
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-3 space-y-8">
              {/* Balance and Quick Actions Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <BalanceCard />
                </div>
                <div>
                  <Card className="glass-card modern-shadow h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-sm font-medium">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QuickActionsGrid />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Transaction Metrics */}
              <Card className="glass-card modern-shadow">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    Transaction Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {transactionMetrics.map((metric, index) => (
                      <motion.div
                        key={metric.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="glass-card p-4 metrics-card"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <metric.icon className="h-5 w-5 text-blue-400" />
                          <span className="text-green-400 text-xs font-medium">{metric.change}</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                        <div className="text-white/70 text-sm">{metric.title}</div>
                        <div className="text-white/50 text-xs mt-1">{metric.period}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <RecentActivityCard />
            </div>
            
            {/* Right Column - Status Cards */}
            <div className="space-y-6">              
              <Card className="glass-card modern-shadow">
                <CardHeader>
                  <CardTitle className="text-white text-sm">AI Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="glass-card p-3 bg-blue-500/10 border-blue-500/20">
                    <div className="text-blue-400 text-xs font-medium mb-1">Optimization Tip</div>
                    <div className="text-white/90 text-sm">Send to EUR now to save 3% on exchange rates</div>
                  </div>
                  <div className="glass-card p-3 bg-green-500/10 border-green-500/20">
                    <div className="text-green-400 text-xs font-medium mb-1">Savings Alert</div>
                    <div className="text-white/90 text-sm">You've saved $45 this month vs traditional banks</div>
                  </div>
                </CardContent>
              </Card>
              
              <StatsGrid />
            </div>
          </div>

          {/* Bottom Section - Enhanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TransferImpact />
            <TransactionStatus />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
