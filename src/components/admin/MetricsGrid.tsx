
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Globe, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";

interface MarketMetric {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

const marketMetrics: MarketMetric[] = [
  { title: "Total Users", value: "5.8K", change: "+22%", icon: Users, color: "text-blue-400" },
  { title: "Transaction Volume", value: "$580K", change: "+15%", icon: DollarSign, color: "text-green-400" },
  { title: "Active Markets", value: "12", change: "+3", icon: Globe, color: "text-purple-400" },
  { title: "User Growth Rate", value: "38%", change: "+5%", icon: TrendingUp, color: "text-yellow-400" },
  { title: "Revenue (MTD)", value: "$11.6K", change: "+26%", icon: Target, color: "text-emerald-400" },
  { title: "Premium Users", value: "1.45K", change: "+48%", icon: Users, color: "text-indigo-400" },
];

export function MetricsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {marketMetrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-none bg-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-full bg-white/5 ${metric.color}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-green-400">{metric.change}</span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-sm text-white/60">{metric.title}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
