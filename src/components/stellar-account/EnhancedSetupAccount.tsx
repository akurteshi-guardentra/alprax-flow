
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { Button } from "@/components/ui/button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { AlpraxBrandHeader } from "@/components/brand/AlpraxLogo";
import { Loader2, Wallet, Zap, Shield, DollarSign, Globe, TrendingUp } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";
import { motion } from "framer-motion";
import { useState } from "react";
import { stellar } from "@/lib/stellar";
import { toast } from "sonner";

export function EnhancedSetupAccount() {
  const { setupAccount, isSettingUp } = useStellarAccount();
  const [isAutoFunding, setIsAutoFunding] = useState(false);

  const handleEnhancedSetup = async () => {
    try {
      hapticFeedback("medium");
      setIsAutoFunding(true);
      
      // Create account with automatic funding
      await setupAccount();
      
      // Auto-fund with test XLM (this happens in background, user never sees XLM)
      toast.success("Account created with $1,000 USD test balance");
      
    } catch (error) {
      console.error('Enhanced setup error:', error);
      toast.error('Setup failed. Please try again.');
    } finally {
      setIsAutoFunding(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ModernCard variant="glass" size="lg" className="max-w-lg w-full backdrop-blur-xl bg-white/5 border border-white/10">
          <ModernCardHeader>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <AlpraxBrandHeader size="md" className="mb-6" />
            </motion.div>
            <ModernCardTitle className="text-center text-white">
              Start Your Financial Journey
            </ModernCardTitle>
            <p className="text-center text-white/70 mt-2">
              Join thousands using Alprax Flow for instant, secure global payments
            </p>
          </ModernCardHeader>
          
          <ModernCardContent className="space-y-8">
            {/* Value Propositions */}
            <div className="grid grid-cols-1 gap-4">
              <motion.div 
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">$1,000 Test Balance</h3>
                  <p className="text-sm text-white/70">Start sending money immediately</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Instant Transfers</h3>
                  <p className="text-sm text-white/70">Send money in seconds, not days</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">90% Lower Fees</h3>
                  <p className="text-sm text-white/70">Save more on every transaction</p>
                </div>
              </motion.div>
            </div>

            {/* Setup Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={handleEnhancedSetup}
                disabled={isSettingUp || isAutoFunding}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-4 h-14 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 border-none"
              >
                {isSettingUp || isAutoFunding ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Create Free Account
                  </>
                )}
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="flex items-center justify-center gap-6 pt-4 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2 text-white/60">
                <Shield className="w-4 h-4" />
                <span className="text-xs">Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Globe className="w-4 h-4" />
                <span className="text-xs">Global Coverage</span>
              </div>
            </motion.div>

            <div className="text-center text-xs text-white/50 mt-4">
              Ready in 30 seconds • No credit check • Free to start
            </div>
          </ModernCardContent>
        </ModernCard>
      </motion.div>
    </div>
  );
}
