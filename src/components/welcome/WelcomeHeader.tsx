
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../LanguageSelector";
import { useIsMobile } from "@/hooks/use-mobile";

export function WelcomeHeader() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <div className="text-left space-y-4 sm:space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-block px-3 sm:px-4 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-full border border-purple-500/20"
        >
          <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            {t('welcome.tagline')}
          </span>
        </motion.div>
        <LanguageSelector />
      </div>
      
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
      >
        {t('welcome.title')}
        <br />
        <span className="text-2xl sm:text-3xl lg:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          {t('welcome.subtitle')}
        </span>
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-base sm:text-lg text-white/80 max-w-xl"
      >
        {t('welcome.description')}
      </motion.p>
    </div>
  );
}
