
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransferImpact } from "@/hooks/useTransferImpact";
import { Loader2, Leaf, Clock, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";

export function TransferImpact() {
  const { stats, isLoading, impactMetrics = [] } = useTransferImpact();

  if (isLoading) {
    return (
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          Your Transfer Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="flex items-center gap-3">
              <PiggyBank className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-medium text-emerald-400">Fees Saved</h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              ${stats.totalFeeSaved.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-lg bg-green-500/10 border border-green-500/20"
          >
            <div className="flex items-center gap-3">
              <Leaf className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-medium text-green-400">Carbon Footprint Reduced</h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {stats.totalCarbonSaved.toFixed(2)} kg CO₂
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-blue-400">Time Saved</h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {Math.round(stats.totalTimeSaved / 60)} hours
            </p>
          </motion.div>

          <div className="md:col-span-3">
            <h3 className="text-lg font-medium text-white mb-4">Recent Transfers</h3>
            <div className="space-y-4">
              {impactMetrics?.slice(0, 5).map((metric) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-white/60">
                        {new Date(metric.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-lg font-medium text-white">
                        Saved ${metric.fees_saved.toFixed(2)} in fees
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/60">Compared to traditional</p>
                      <p className="text-sm text-emerald-400">
                        {((metric.fees_saved / metric.traditional_fee_estimate) * 100).toFixed(0)}% cheaper
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
