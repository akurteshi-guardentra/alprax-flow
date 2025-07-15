
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";
import { EnhancedTransactionList } from "@/components/transaction/EnhancedTransactionList";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

const Dashboard = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check if user has completed onboarding
    return !localStorage.getItem('onboarding_completed');
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen modern-gradient">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:space-y-8"
        >
          <DashboardHeader />
          
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              <BalanceCard />
              <EnhancedTransactionList />
            </div>
            
            <div className="space-y-6 lg:space-y-8">
              <QuickActionsGrid />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
