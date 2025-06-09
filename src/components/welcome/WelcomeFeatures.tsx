
import { motion } from "framer-motion";
import { SecurityInsightsPanel } from "@/components/welcome/SecurityInsightsPanel";
import { MonetizationOverview } from "@/components/welcome/MonetizationOverview";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function WelcomeFeatures() {
  return (
    <>
      <motion.section
        variants={itemVariants}
        className="space-y-8 backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-xl mx-4"
      >
        <SecurityInsightsPanel />
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="px-4"
      >
        <MonetizationOverview />
      </motion.section>
    </>
  );
}
