
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface TwoFactorFormProps {
  twoFactorCode: string;
  setTwoFactorCode: (code: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const TwoFactorForm = ({ twoFactorCode, setTwoFactorCode, isLoading, onSubmit }: TwoFactorFormProps) => {
  return (
    <>
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white">Two-Factor Auth</h2>
          <p className="text-white/60 mt-2">Enter the 6-digit code from your authenticator app</p>
        </motion.div>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-6 mt-8">
        <div className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder="6-digit code"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full pl-10 bg-white/10 border border-white/10 text-white placeholder:text-white/40 h-12 rounded-md"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              required
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-white text-black hover:bg-white/90 h-12 text-base"
            disabled={isLoading || twoFactorCode.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </form>
    </>
  );
};
