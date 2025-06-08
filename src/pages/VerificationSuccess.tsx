
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const VerificationSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1A1F2C] relative overflow-hidden">
      {/* Gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-green-500/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-md mx-auto relative px-4 py-8 h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 
            }}
            className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle className="w-12 h-12 text-green-400" />
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white">Documents submitted</h1>
            <p className="text-white/60">
              We've received your documents and will review them shortly. We'll notify you once the verification is complete.
            </p>
          </div>

          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full py-6 bg-white text-blue-900 hover:bg-white/90"
          >
            Go to Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default VerificationSuccess;
