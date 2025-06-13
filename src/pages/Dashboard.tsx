
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { StellarAccount } from "@/components/stellar-account";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, User, BarChart, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { FiatDisplay } from "@/components/currency/FiatDisplay";
import { signOut } from "@/lib/auth";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SimpleTransactionHistory } from "@/components/SimpleTransactionHistory";
import { QuickActionButtons } from "@/components/QuickActionButtons";

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { balance } = useStellarAccount();

  const accountBalance = balance && balance.length > 0 ? balance[0].balance : "0";

  const handleLogout = async () => {
    const success = await signOut();
    if (success) {
      navigate('/');
    }
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen modern-gradient p-4 pb-24 sm:pb-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-500/15 rounded-full blur-xl animate-modern-pulse"></div>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-modern">
            Alprax Dashboard
          </h1>
          <div className="flex gap-2">
            {!isMobile && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/profile')}
                  className="glass-card-hover text-white border-none"
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/analytics')}
                  className="glass-card-hover text-white border-none"
                >
                  <BarChart className="h-5 w-5 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/settings')}
                  className="glass-card-hover text-white border-none"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </Button>
                <LanguageSelector />
              </>
            )}
            <Card 
              className="cursor-pointer glass-card-hover modern-shadow"
              onClick={handleLogout}
            >
              <CardContent className="p-3 flex items-center justify-center gap-2">
                <LogOut className="h-5 w-5 text-white" />
                {!isMobile && <span className="text-white text-sm">Logout</span>}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {isMobile && (
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-end mb-4"
          >
            <LanguageSelector />
          </motion.div>
        )}

        {/* Balance Card */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <Card className="glass-card modern-shadow">
            <CardContent className="p-6 text-center">
              <p className="text-white/70 text-sm mb-2">Available Balance</p>
              <div className="text-4xl font-bold text-white mb-4">
                <FiatDisplay xlmAmount={accountBalance} currency="USD" />
              </div>
              <p className="text-white/60 text-sm">Alprax Account</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <QuickActionButtons />
        </motion.div>

        {/* Stellar Account */}
        <motion.div variants={itemVariants} className="mb-8">
          <StellarAccount />
        </motion.div>

        {/* Transaction History */}
        <motion.div variants={itemVariants}>
          <SimpleTransactionHistory />
        </motion.div>
      </motion.div>
      
      {isMobile && <MobileBottomNav />}
    </div>
  );
}
