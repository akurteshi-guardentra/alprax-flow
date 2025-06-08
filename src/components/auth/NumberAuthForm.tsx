
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberAuthFormProps {
  onSubmit: (code: string) => Promise<void>;
  isLoading: boolean;
  onBack: () => void;
}

export const NumberAuthForm = ({ onSubmit, isLoading, onBack }: NumberAuthFormProps) => {
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(code);
  };

  return (
    <>
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white">Number Authentication</h2>
          <p className="text-white/60 mt-2">Enter your 6-digit code to sign in</p>
        </motion.div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <div className="relative">
          <KeyRound className="absolute left-3 top-3 h-5 w-5 text-white/40" />
          <Input
            type="number"
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.slice(0, 6))}
            className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12"
            required
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <Button 
            type="submit" 
            className="w-full bg-white text-black hover:bg-white/90 h-12 text-base"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
          <div className="text-center">
            <button 
              type="button"
              onClick={onBack}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Back to login options
            </button>
          </div>
        </motion.div>
      </form>
    </>
  );
};
