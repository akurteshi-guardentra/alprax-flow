
import { motion } from "framer-motion";
import { FeatureComparisonTable } from "@/components/welcome/FeatureComparisonTable";

const itemVariants = {
  hidden: { opacity: 0, y: 20, rotateX: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export function WelcomeComparison() {
  return (
    <motion.section
      variants={itemVariants}
      className="px-4 preserve-3d"
    >
      <div className="glass-neo rounded-2xl p-8 backdrop-blur-xl border border-white/10 shadow-xl transform transition-all duration-300 hover:translate-z-10 hover:shadow-2xl">
        <FeatureComparisonTable />
      </div>
    </motion.section>
  );
}
