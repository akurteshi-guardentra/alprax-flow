
import { motion } from "framer-motion";

export const SecurityBadge = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-6 text-center"
    >
      <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/[0.08] backdrop-blur-lg border border-white/[0.08]">
        <svg
          className="w-4 h-4 text-green-400 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span className="text-sm text-white/60">End-to-end encrypted</span>
      </span>
    </motion.div>
  );
};
