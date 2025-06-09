
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsOverview } from "@/components/analytics/MetricsOverview";
import { TransactionVolumeChart } from "@/components/analytics/TransactionVolumeChart";
import { TransactionTypesChart } from "@/components/analytics/TransactionTypesChart";
import { ChartBar } from "lucide-react";
import { motion } from "framer-motion";
import { hapticFeedback } from "@/lib/haptics";

export function DashboardAnalytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      onAnimationComplete={() => hapticFeedback("light")}
    >
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <ChartBar className="h-5 w-5 text-blue-400" />
            Transaction Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <MetricsOverview />
          
          <div className="grid gap-6 md:grid-cols-2">
            <TransactionVolumeChart />
            <TransactionTypesChart />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
