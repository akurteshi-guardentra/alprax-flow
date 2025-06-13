
import { motion } from 'framer-motion';

export function ProcessingStep() {
  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8"
    >
      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white font-medium">Processing...</p>
      <p className="text-white/60 text-sm">This may take a few seconds</p>
    </motion.div>
  );
}
