
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { FiatDisplay } from "@/components/currency/FiatDisplay";
import { AlpraxBrandHeader } from "@/components/brand/AlpraxLogo";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Send, 
  CreditCard, 
  TrendingUp,
  Globe,
  Shield,
  Zap,
  Users
} from "lucide-react";
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { useTestAccounts } from "@/hooks/useTestAccounts";

const quickActions = [
  {
    icon: Send,
    title: "Send Money",
    description: "Transfer funds globally",
    color: "from-blue-500 to-purple-600",
    route: "/payments"
  },
  {
    icon: ArrowDownLeft,
    title: "Request Money",
    description: "Generate payment request",
    color: "from-green-500 to-teal-600",
    route: "/request"
  },
  {
    icon: CreditCard,
    title: "Add Funds",
    description: "Top up your balance",
    color: "from-purple-500 to-pink-600",
    route: "/add-funds"
  },
  {
    icon: Users,
    title: "Contacts",
    description: "Manage recipients",
    color: "from-orange-500 to-red-600",
    route: "/contacts"
  }
];

const stats = [
  {
    icon: TrendingUp,
    title: "Total Saved",
    value: "$2,847",
    change: "+12.5%",
    color: "text-green-400"
  },
  {
    icon: Globe,
    title: "Countries Served",
    value: "120+",
    change: "Growing",
    color: "text-blue-400"
  },
  {
    icon: Zap,
    title: "Avg. Transfer Time",
    value: "8 sec",
    change: "Instant",
    color: "text-purple-400"
  }
];

export default function ModernDashboard() {
  const navigate = useNavigate();
  const { account, isLoading } = useStellarAccount();
  const { activeAccount } = useTestAccounts();
  
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

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
      {/* Header */}
      <div className="p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <AlpraxBrandHeader size="sm" />
            <motion.h1 
              className="text-2xl font-bold text-white mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {greeting}
            </motion.h1>
            <p className="text-white/70">Welcome back to Alprax Flow</p>
          </div>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => navigate("/profile")}
          >
            Profile
          </Button>
        </motion.div>

        {/* Balance Card */}
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
                      xlmAmount={activeAccount?.balance || "0"} 
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <ModernCard 
                  variant="glass" 
                  className="cursor-pointer hover:scale-105 transition-transform duration-200 bg-white/5 border border-white/10"
                  onClick={() => navigate(action.route)}
                >
                  <ModernCardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto mb-3`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{action.title}</h3>
                    <p className="text-white/60 text-xs">{action.description}</p>
                  </ModernCardContent>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Your Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <ModernCard variant="glass" className="bg-white/5 border border-white/10">
                  <ModernCardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-white/70 text-xs">{stat.title}</p>
                        <p className="text-white font-bold text-lg">{stat.value}</p>
                        <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                      </div>
                    </div>
                  </ModernCardContent>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => navigate("/history")}
            >
              View All
            </Button>
          </div>
          <ModernCard variant="glass" className="bg-white/5 border border-white/10">
            <ModernCardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <ArrowUpRight className="w-8 h-8 text-white/60" />
              </div>
              <p className="text-white/70 mb-4">No recent transactions</p>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none"
                onClick={() => navigate("/payments")}
              >
                Send Your First Payment
              </Button>
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
}
