
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserAccount } from '@/hooks/useUserAccount';
import { FiatDisplay } from '@/components/currency/FiatDisplay';

interface QuickFundButtonProps {
  variant?: 'default' | 'compact' | 'card';
  showBalance?: boolean;
}

export function QuickFundButton({ variant = 'default', showBalance = true }: QuickFundButtonProps) {
  const navigate = useNavigate();
  const { balance } = useUserAccount();
  const [isHovered, setIsHovered] = useState(false);

  const accountBalance = balance || 0;
  const isLowBalance = accountBalance < 10;

  const handleFundAccount = () => {
    navigate('/fund-account');
  };

  if (variant === 'compact') {
    return (
      <Button
        onClick={handleFundAccount}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
        size="sm"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Funds
      </Button>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="glass-card modern-shadow cursor-pointer group" onClick={handleFundAccount}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-green-600">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Add Funds</h3>
                <p className="text-white/60 text-sm">Fund your account instantly</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="space-y-3"
    >
      {showBalance && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Available Balance</p>
            <div className="text-xl font-bold text-white">
              ${accountBalance.toFixed(2)}
            </div>
          </div>
          {isLowBalance && (
            <div className="bg-orange-500/20 px-2 py-1 rounded-full">
              <p className="text-orange-300 text-xs">Low Balance</p>
            </div>
          )}
        </div>
      )}
      
      <Button
        onClick={handleFundAccount}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 h-12"
      >
        <motion.div
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Funds to Account</span>
          <DollarSign className="w-4 h-4" />
        </motion.div>
      </Button>
      
      <p className="text-white/40 text-xs text-center">
        Multiple payment methods • Instant processing • Secure transactions
      </p>
    </motion.div>
  );
}
