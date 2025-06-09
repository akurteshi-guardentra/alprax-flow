
import { motion } from "framer-motion";
import { SecurityInsightsPanel } from "@/components/welcome/SecurityInsightsPanel";
import { MonetizationOverview } from "@/components/welcome/MonetizationOverview";
import { CustomerTestimonials } from "@/components/welcome/CustomerTestimonials";
import { FeatureComparisonTable } from "@/components/welcome/FeatureComparisonTable";
import { PricingTiers } from "@/components/welcome/PricingTiers";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function WelcomeMobileContent() {
  return (
    <motion.div
      variants={containerVariants}
      className="space-y-8 px-4"
    >
      <motion.div variants={itemVariants}>
        <SecurityInsightsPanel />
      </motion.div>
      <motion.div variants={itemVariants}>
        <MonetizationOverview />
      </motion.div>
      <motion.div variants={itemVariants}>
        <CustomerTestimonials />
      </motion.div>
      <motion.div variants={itemVariants}>
        <FeatureComparisonTable />
      </motion.div>
      <motion.div variants={itemVariants}>
        <PricingTiers />
      </motion.div>
    </motion.div>
  );
}
