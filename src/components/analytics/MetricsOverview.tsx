
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, DollarSign, Activity, BarChart3, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useTransactionAnalytics } from "@/hooks/useTransactionAnalytics";

export function MetricsOverview() {
  const { metrics, isLoading } = useTransactionAnalytics();
  
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-none bg-white/10 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-none bg-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-full bg-white/5 ${
                  metric.title.includes("Volume") ? "text-blue-400" :
                  metric.title.includes("Net") ? "text-green-400" :
                  metric.title.includes("Avg") ? "text-purple-400" :
                  "text-yellow-400"
                }`}>
                  {metric.title.includes("Volume") ? <DollarSign className="h-5 w-5" /> :
                   metric.title.includes("Net") ? <Activity className="h-5 w-5" /> :
                   metric.title.includes("Avg") ? <BarChart3 className="h-5 w-5" /> :
                   <CreditCard className="h-5 w-5" />}
                </div>
                {metric.trend && (
                  <span className={`text-sm font-medium ${
                    metric.trend === "up" ? "text-green-400" :
                    metric.trend === "down" ? "text-red-400" :
                    "text-white/60"
                  } flex items-center`}>
                    {metric.trend === "up" && <TrendingUp className="h-3.5 w-3.5 mr-1" />}
                    {metric.trend === "down" && <TrendingDown className="h-3.5 w-3.5 mr-1" />}
                    {metric.trend === "neutral" && <Minus className="h-3.5 w-3.5 mr-1" />}
                    {metric.change || ""}
                  </span>
                )}
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
