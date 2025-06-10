
import React from 'react';
import { motion } from 'framer-motion';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { AlpraxBrandHeader } from '@/components/brand/AlpraxLogo';
import { useStellarAccount } from '@/hooks/useStellarAccount';
import { SetupAccount } from '@/components/stellar-account/SetupAccount';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  Send, 
  TrendingUp, 
  Shield, 
  Users, 
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hapticFeedback } from '@/lib/haptics';
import { Badge } from '@/components/ui/badge';

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'default' | 'success' | 'warning';
}

function QuickAction({ icon, title, description, onClick, variant = 'default' }: QuickActionProps) {
  const variantClasses = {
    default: 'from-blue-500/20 to-purple-500/20',
    success: 'from-green-500/20 to-blue-500/20',
    warning: 'from-orange-500/20 to-red-500/20'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <ModernCard variant="glass" className="h-full transition-all duration-300 hover:bg-white/15">
        <ModernCardContent className="p-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${variantClasses[variant]} flex items-center justify-center mb-3`}>
            {icon}
          </div>
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-white/70 text-sm">{description}</p>
        </ModernCardContent>
      </ModernCard>
    </motion.div>
  );
}

const ModernDashboard = () => {
  const { account, balance, isLoading, fundAccount, isFunding } = useStellarAccount();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    hapticFeedback('light');
    navigate(path);
  };

  const handleFundAccount = () => {
    hapticFeedback('medium');
    fundAccount();
  };

  // Show setup if no account
  if (!account && !isLoading) {
    return <SetupAccount />;
  }

  const xlmBalance = balance && balance.length > 0 ? parseFloat(balance[0].balance) : 0;
  const usdBalance = xlmBalance * 0.12; // Mock conversion rate

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <AlpraxBrandHeader size="md" showTagline={false} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigation('/profile')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Profile
          </Button>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ModernCard variant="gradient" size="lg">
            <ModernCardContent className="text-center">
              <div className="mb-4">
                <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                  Total Balance
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-4xl font-bold text-white">
                  ${usdBalance.toFixed(2)}
                </div>
                <div className="text-white/60 text-sm">
                  ≈ {xlmBalance.toFixed(2)} XLM
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => handleNavigation('/payments')}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Money
                </Button>
                <Button
                  onClick={handleFundAccount}
                  disabled={isFunding}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <QuickAction
            icon={<Send className="w-6 h-6 text-blue-400" />}
            title="Send Payment"
            description="Transfer money instantly"
            onClick={() => handleNavigation('/payments')}
          />
          <QuickAction
            icon={<TrendingUp className="w-6 h-6 text-green-400" />}
            title="Analytics"
            description="View your spending"
            onClick={() => handleNavigation('/analytics')}
            variant="success"
          />
          <QuickAction
            icon={<CreditCard className="w-6 h-6 text-purple-400" />}
            title="Cards"
            description="Manage payment methods"
            onClick={() => handleNavigation('/cards')}
          />
          <QuickAction
            icon={<Shield className="w-6 h-6 text-orange-400" />}
            title="Security"
            description="Account protection"
            onClick={() => handleNavigation('/settings')}
            variant="warning"
          />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ModernCard variant="glass">
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center justify-between">
                Recent Activity
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('/payments')}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  View All
                </Button>
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-4">
                {/* Mock transaction items */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <ArrowDownLeft className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Welcome Bonus</div>
                      <div className="text-white/60 text-sm">Account funded</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-semibold">+$1,200.00</div>
                </div>

                <div className="text-center py-8 text-white/60">
                  <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Start sending money to see your activity here</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>

        {/* Bottom Navigation Space */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default ModernDashboard;
