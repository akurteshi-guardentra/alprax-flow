
import { motion } from "framer-motion";
import { WelcomeHeader } from "@/components/welcome/WelcomeHeader";
import { FeatureGrid } from "@/components/welcome/FeatureGrid";
import { ActionButtons } from "@/components/welcome/ActionButtons";
import { TechBadges } from "@/components/welcome/TechBadges";
import { BenefitsPreview } from "@/components/welcome/BenefitsPreview";
import { useIsMobile } from "@/hooks/use-mobile";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function WelcomeHero() {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      variants={containerVariants}
      className={`flex flex-col ${isMobile ? '' : 'lg:flex-row'} items-center justify-between gap-8 sm:gap-12 px-4`}
    >
      <div className={`w-full ${isMobile ? '' : 'lg:w-1/2'} space-y-6 sm:space-y-8`}>
        <motion.div variants={itemVariants}>
          <WelcomeHeader />
        </motion.div>
        <motion.div variants={itemVariants}>
          <TechBadges />
        </motion.div>
        <motion.div variants={itemVariants}>
          <FeatureGrid />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ActionButtons />
        </motion.div>
      </div>
      
      {!isMobile && (
        <motion.div 
          variants={containerVariants}
          className="w-full lg:w-1/2 mt-8 lg:mt-0"
        >
          <BenefitsPreview />
        </motion.div>
      )}
    </motion.div>
  );
}
