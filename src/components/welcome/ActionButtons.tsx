
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { EnhancedActionButton } from "./EnhancedActionButton";
import { ArrowRight, UserPlus } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";
import { useEffect } from "react";

export function ActionButtons() {
  const isMobile = useIsMobile();
  
  // Add initial haptic feedback when buttons appear
  useEffect(() => {
    if (isMobile) {
      hapticFeedback('light');
    }
  }, [isMobile]);
  
  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    tap: { scale: 0.98 }
  };
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start",
        isMobile ? "items-center" : "items-start"
      )}
    >
      <motion.div
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileTap="tap"
        className="w-full sm:w-auto"
      >
        <EnhancedActionButton
          to="/login"
          variant="primary"
          icon={<ArrowRight className="ml-2 h-5 w-5" />}
          className={cn(
            "w-full sm:w-auto font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
            isMobile ? 'text-base py-4 px-6' : 'sm:text-lg sm:py-6 sm:px-8'
          )}
        >
          Start Sending Money
        </EnhancedActionButton>
      </motion.div>
      
      <motion.div
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileTap="tap"
        transition={{ delay: 0.1 }}
        className="w-full sm:w-auto"
      >
        <EnhancedActionButton
          to="/signup"
          variant="secondary"
          icon={<UserPlus className="ml-2 h-5 w-5" />}
          className={cn(
            "w-full sm:w-auto font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
            isMobile ? 'text-base py-4 px-6' : 'sm:text-lg sm:py-6 sm:px-8'
          )}
        >
          Create Free Account
        </EnhancedActionButton>
      </motion.div>
    </motion.div>
  );
}
