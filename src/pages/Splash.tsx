
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/welcome");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-red-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8,
            ease: [0, 0.71, 0.2, 1.01],
            scale: {
              type: "spring",
              damping: 10,
              stiffness: 100,
              restDelta: 0.001
            }
          }}
          className="flex flex-col items-center space-y-6"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-200 to-blue-400">
              Alprax
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 text-center">
            Secure Cross-Border Payments
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Splash;
