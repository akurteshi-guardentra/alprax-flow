
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { Button } from "@/components/ui/button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { AlpraxBrandHeader } from "@/components/brand/AlpraxLogo";
import { Loader2, Wallet, Zap, Shield } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";
import { motion } from "framer-motion";

export function SetupAccount() {
  const { setupAccount, isSettingUp } = useStellarAccount();

  const handleSetupAccount = () => {
    hapticFeedback("medium");
    setupAccount();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
      <ModernCard variant="glass" size="lg" className="max-w-md w-full">
        <ModernCardHeader>
          <AlpraxBrandHeader size="md" className="mb-6" />
          <ModernCardTitle className="text-center">
            Welcome to Your Financial Future
          </ModernCardTitle>
        </ModernCardHeader>
        
        <ModernCardContent className="space-y-6">
          <div className="text-center text-white/70 mb-8">
            <p>Let's set up your secure payment account with instant test funds</p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4 mb-8">
            <motion.div 
              className="flex items-center gap-3 text-white/80"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm">Instant setup with test funds</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-3 text-white/80"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-sm">Lightning-fast transfers</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-3 text-white/80"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm">Bank-level security</span>
            </motion.div>
          </div>

          <Button
            onClick={handleSetupAccount}
            disabled={isSettingUp}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 h-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isSettingUp ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up Your Account...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Create My Account
              </>
            )}
          </Button>

          <div className="text-center text-xs text-white/50 mt-4">
            Your account will be ready in seconds with 10,000 test XLM
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
}
