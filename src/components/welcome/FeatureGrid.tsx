
import { motion } from "framer-motion";
import { Coins, Clock, Heart, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const features = [
  {
    icon: <Coins className="w-6 h-6 text-purple-400" />,
    translationKey: "fees",
    delay: 0.2
  },
  {
    icon: <Clock className="w-6 h-6 text-pink-400" />,
    translationKey: "instant",
    delay: 0.3
  },
  {
    icon: <Heart className="w-6 h-6 text-indigo-400" />,
    translationKey: "support",
    delay: 0.4
  }
];

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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export function FeatureGrid() {
  const { t } = useTranslation();

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          transition={{ delay: feature.delay }}
          className="group relative overflow-hidden bg-white/5 backdrop-blur-lg rounded-xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer border border-white/10"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 space-y-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-3 inline-block">
              {feature.icon}
            </div>
            <h3 className="text-white font-semibold text-lg">
              {t(`features.${feature.translationKey}.title`)}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {t(`features.${feature.translationKey}.description`)}
            </p>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/90 transition-colors absolute bottom-4 right-4" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
