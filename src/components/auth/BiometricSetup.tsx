import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Fingerprint, AlertTriangle, Check, X, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";

interface BiometricSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export const BiometricSetup = ({ onComplete, onCancel, compact = false }: BiometricSetupProps) => {
  const [registering, setRegistering] = useState(false);
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { 
    isBiometricAvailable, 
    isRegistered, 
    isSupported, 
    loading, 
    register, 
    deregister 
  } = useBiometricAuth();

  // Handle registration
  const handleRegister = async () => {
    setRegistering(true);
    
    try {
      const result = await register();
      
      if (result.success) {
        toast.success(result.message);
        if (onComplete) onComplete();
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast.error(error.message || "Failed to set up biometric authentication");
    } finally {
      setRegistering(false);
    }
  };

  // Handle deregistration
  const handleDeregister = async () => {
    setRegistering(true);
    
    try {
      const result = await deregister();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to remove biometric authentication");
      }
    } catch (error: any) {
      console.error('Error during deregistration:', error);
      toast.error(error.message || "Failed to remove biometric authentication");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Card className={compact ? "bg-white/5 border-white/10" : "bg-white/10 border-white/10 backdrop-blur-sm"}>
      <CardHeader className={compact ? "px-4 py-3" : "px-6"}>
        <CardTitle className="text-white flex items-center gap-2 text-xl">
          <Fingerprint className="h-5 w-5 text-primary" />
          Biometric Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "px-4 pb-3 pt-0" : "px-6"}>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin text-white/70" />
          </div>
        ) : !isSupported ? (
          <motion.div
            initial={shouldAnimate ? { opacity: 0 } : undefined}
            animate={{ opacity: 1 }}
            transition={getTransition({ duration: 0.3 })}
            className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/20"
          >
            <X className="h-6 w-6 text-red-400" />
            <div>
              <h3 className="font-medium text-white">Not Supported</h3>
              <p className="text-sm text-white/70">
                Your device or browser doesn't support biometric authentication
              </p>
            </div>
          </motion.div>
        ) : isRegistered ? (
          <div className="space-y-4">
            <motion.div
              initial={shouldAnimate ? { opacity: 0 } : undefined}
              animate={{ opacity: 1 }}
              transition={getTransition({ duration: 0.3 })}
              className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20"
            >
              <Check className="h-6 w-6 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-white">Biometric Authentication Enabled</h3>
                <p className="text-sm text-white/70">
                  You can now use your fingerprint or face ID to log in
                </p>
              </div>
            </motion.div>
            
            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={handleDeregister}
              disabled={registering}
            >
              {registering ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Remove Biometric Authentication
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-400" />
                  Supported Device
                </h3>
                <p className="text-sm text-white/70 mt-1">
                  Your device supports biometric authentication
                </p>
              </div>
              
              {!compact && (
                <div className="flex-1 bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-blue-400" />
                    Quick & Secure
                  </h3>
                  <p className="text-sm text-white/70 mt-1">
                    Log in instantly with your fingerprint or face ID
                  </p>
                </div>
              )}
            </div>
            
            {!compact && (
              <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 flex gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-300">
                  Your biometric data never leaves your device. We only store a secure credential.
                </p>
              </div>
            )}
            
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={handleRegister}
              disabled={registering}
            >
              {registering ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Fingerprint className="h-4 w-4 mr-2" />
              )}
              Enable Biometric Authentication
            </Button>
          </div>
        )}
      </CardContent>
      
      {!compact && onCancel && (
        <CardFooter className="px-6 pb-6 pt-0">
          <Button variant="ghost" onClick={onCancel} className="w-full text-white/70 hover:text-white hover:bg-white/10">
            Cancel
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
