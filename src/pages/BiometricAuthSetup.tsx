import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Fingerprint } from "lucide-react";
import { BiometricSetup } from "@/components/auth/BiometricSetup";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";

const BiometricAuthSetup = () => {
  const navigate = useNavigate();
  const { shouldAnimate, getTransition } = useOptimizedAnimations();

  const handleComplete = () => {
    navigate('/settings');
  };

  const handleCancel = () => {
    navigate('/settings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kosovo-blue via-kosovo-blue/90 to-red-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-md mx-auto relative">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/settings')}
          className="absolute top-4 left-0 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>

        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          className="pt-20"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={shouldAnimate ? { scale: 0.9, opacity: 0 } : undefined}
              animate={{ scale: 1, opacity: 1 }}
              transition={getTransition({ type: 'spring', stiffness: 300, damping: 25 })}
              className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4"
            >
              <Fingerprint className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Biometric Authentication</h1>
            <p className="text-white/80 mt-2">Set up fingerprint or face ID for faster sign-in</p>
          </div>

          <BiometricSetup onComplete={handleComplete} onCancel={handleCancel} />

          <motion.div 
            className="mt-6 bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-sm"
            initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
            animate={{ opacity: 1, y: 0 }}
            transition={getTransition({ delay: 0.2 })}
          >
            <h3 className="text-white font-medium mb-2">How it works:</h3>
            <ol className="space-y-2 text-white/80 text-sm pl-5 list-decimal">
              <li>Your biometric data stays on your device and is never sent to our servers</li>
              <li>We only store an anonymous credential created by your device</li>
              <li>You can remove biometric authentication at any time</li>
              <li>Traditional password login will still work as a backup</li>
            </ol>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default BiometricAuthSetup;
