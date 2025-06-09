import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-red-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl max-w-md w-full mx-4"
      >
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-white/80 mb-8">
          Oops! The page you're looking for doesn't exist
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-white text-blue-900 hover:bg-white/90"
        >
          Return to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;