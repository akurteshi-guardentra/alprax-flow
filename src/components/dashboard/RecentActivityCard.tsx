
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";

export function RecentActivityCard() {
  const navigate = useNavigate();

  return (
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
  );
}
