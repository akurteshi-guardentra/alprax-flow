
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";

export default function ModernDashboard() {
  const { isLoading } = useStellarAccount();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-48 mx-auto"></div>
          <div className="h-4 bg-white/10 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
      <div className="p-4 sm:p-6">
        <DashboardHeader />
        <BalanceCard />
        <QuickActionsGrid />
        <StatsGrid />
        <RecentActivityCard />
      </div>
    </div>
  );
}
