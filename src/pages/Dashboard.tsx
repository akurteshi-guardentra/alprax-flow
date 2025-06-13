
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SimplifiedPaymentFlow } from "@/components/transaction/SimplifiedPaymentFlow";
import { TestAccountView } from "@/components/stellar-account/TestAccountView";
import { TransactionHistory } from "@/components/TransactionHistory";
import { StellarAccount } from "@/components/stellar-account";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, TrendingUp, DollarSign, User, BarChart, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { FiatDisplay } from "@/components/currency/FiatDisplay";
import { signOut } from "@/lib/auth";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useState } from "react";
import { CleanFundButton } from "@/components/funding/CleanFundButton";

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { balance } = useStellarAccount();
  const [showDeveloperMode, setShowDeveloperMode] = React.useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'send-money' | 'security'>('overview');

  // Get real account balance
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

  const quickStats = [
    {
      title: "Available Balance",
      value: <FiatDisplay xlmAmount={accountBalance} currency="USD" />,
      icon: DollarSign,
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "This Month",
      value: "$850.00",
      icon: TrendingUp,
      change: "+8%", 
      changeType: "positive"
    }
  ];

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
    <div className="min-h-screen modern-gradient p-2 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-8 relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-500/15 rounded-full blur-xl animate-modern-pulse"></div>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center mb-6 sm:mb-8 px-2"
        >
          <motion.h1 
            className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-modern"
          >
            Alprax Dashboard
          </motion.h1>
          <div className="flex gap-2">
            {!isMobile && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/profile')}
                  className="glass-card-hover text-white border-none"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/analytics')}
                  className="glass-card-hover text-white border-none"
                >
                  <BarChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigateTo('/settings')}
                  className="glass-card-hover text-white border-none"
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Settings
                </Button>
                <LanguageSelector />
              </>
            )}
            <Card 
              className="cursor-pointer glass-card-hover modern-shadow"
              onClick={handleLogout}
            >
              <CardContent className="p-2 sm:p-3 flex items-center justify-center gap-2">
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
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

        {/* Developer Mode Toggle */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-end mb-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeveloperMode(!showDeveloperMode)}
            className="glass-card-hover text-white border-white/20"
          >
            <Settings className="h-4 w-4 mr-1" />
            {showDeveloperMode ? 'Hide' : 'Show'} Developer Mode
          </Button>
        </motion.div>

        {/* Simplified Balance and Quick Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {quickStats.map((stat, index) => (
            <Card key={stat.title} className="glass-card modern-shadow metrics-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-8 w-8 text-blue-400" />
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-400' : 
                    stat.changeType === 'negative' ? 'text-red-400' : 'text-white/70'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/70 text-sm flex items-center justify-between">
                  <span>{stat.title}</span>
                  {index === 0 && <CleanFundButton variant="compact" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Simplified Account Display */}
        <motion.div variants={itemVariants} className="mb-8">
          <StellarAccount />
        </motion.div>

        {/* Section Navigation */}
        <motion.div variants={itemVariants} className="flex justify-center my-6">
          <div className="inline-flex bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            <Button
              variant="ghost"
              onClick={() => setActiveSection('overview')}
              className={`rounded-md px-4 py-2 text-sm ${
                activeSection === 'overview'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Overview
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveSection('send-money')}
              className={`rounded-md px-4 py-2 text-sm ${
                activeSection === 'send-money'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Send Money
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveSection('security')}
              className={`rounded-md px-4 py-2 text-sm ${
                activeSection === 'security'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Security
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
        >
          {/* Conditional content based on active section */}
          {activeSection === 'overview' && (
            <motion.div variants={itemVariants}>
              <TransactionHistory />
            </motion.div>
          )}

          {activeSection === 'send-money' && (
            <motion.div variants={itemVariants}>
              {showDeveloperMode ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <Card className="glass-card modern-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-white font-semibold mb-4">Developer Accounts (Demo Only)</h3>
                        <div className="bg-yellow-500/10 p-3 rounded border border-yellow-500/20 mb-4">
                          <p className="text-yellow-300 text-xs">
                            ⚠️ These are demo accounts for development purposes only
                          </p>
                        </div>
                        <TestAccountView />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <Card className="glass-card modern-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-white font-semibold mb-4">Send Money</h3>
                        <SimplifiedPaymentFlow isMobile={isMobile} />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <SimplifiedPaymentFlow isMobile={isMobile} />
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {activeSection === 'security' && (
            <motion.div variants={itemVariants}>
              <SecurityDashboard />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      {isMobile && <MobileBottomNav />}
    </div>
  );
}
