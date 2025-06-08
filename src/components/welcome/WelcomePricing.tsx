
import { motion } from "framer-motion";
import { PricingTiers } from "@/components/welcome/PricingTiers";

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

export function WelcomePricing() {
  return (
    <motion.section
      variants={itemVariants}
      className="preserve-3d px-4"
    >
      <div className="glass-neo rounded-2xl p-8 backdrop-blur-xl border border-white/10 shadow-xl transform transition-all duration-300 hover:translate-z-10 hover:shadow-2xl">
        <PricingTiers />
      </div>
    </motion.section>
  );
}
