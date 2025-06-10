
import { motion } from "framer-motion";
import { TrendingUp, Globe, Zap } from "lucide-react";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";

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

export function StatsGrid() {
  return (
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
  );
}
