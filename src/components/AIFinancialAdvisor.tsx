import { SpendingAnalytics } from "./financial/SpendingAnalytics";
import { AIInsights } from "./financial/AIInsights";
import { motion } from "framer-motion";

export function AIFinancialAdvisor() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid gap-6"
    >
      <SpendingAnalytics />
      <AIInsights />
    </motion.div>
  );
}