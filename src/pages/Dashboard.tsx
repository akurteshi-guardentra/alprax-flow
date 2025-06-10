
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SimplifiedPaymentFlow } from "@/components/transaction/SimplifiedPaymentFlow";
import { TestAccountView } from "@/components/stellar-account/TestAccountView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Shield, TrendingUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { FiatDisplay } from "@/components/currency/FiatDisplay";

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { balance } = useStellarAccount();
  const [showTestAccounts, setShowTestAccounts] = React.useState(false);

  // Get real account balance
  const accountBalance = balance && balance.length > 0 ? balance[0].balance : "0";

  const quickStats = [
    {
      title: "Total Balance",
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
    },
    {
      title: "Security Score",
      value: "98/100",
      icon: Shield,
      change: "Excellent",
      changeType: "neutral"
    }
  ];

  return (
    <div className="min-h-screen modern-gradient p-4 sm:p-6 relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-500/15 rounded-full blur-xl animate-modern-pulse"></div>
      </div>

      <div className="container max-w-7xl mx-auto space-y-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="glass-card-hover text-white border-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTestAccounts(!showTestAccounts)}
            className="glass-card-hover text-white border-white/20"
          >
            <Settings className="h-4 w-4 mr-1" />
            {showTestAccounts ? 'Hide' : 'Show'} Test Accounts
          </Button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-start"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-modern mt-4 mb-2">Alprax Dashboard</h1>
          <p className="text-white/70 text-lg">Manage your global payments and transfers</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
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
                <div className="text-white/70 text-sm">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={showTestAccounts ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : ""}
        >
          {showTestAccounts ? (
            <>
              <div className="lg:col-span-1">
                <Card className="glass-card modern-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold mb-4">Test Accounts (Development Only)</h3>
                    <div className="bg-yellow-500/10 p-3 rounded border border-yellow-500/20 mb-4">
                      <p className="text-yellow-300 text-xs">
                        ⚠️ These are test accounts for development purposes only
                      </p>
                    </div>
                    <TestAccountView />
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <Card className="glass-card modern-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold mb-4">Payment Flow</h3>
                    <SimplifiedPaymentFlow isMobile={isMobile} />
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="glass-card modern-shadow">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Send Money</h3>
                <SimplifiedPaymentFlow isMobile={isMobile} />
              </CardContent>
            </Card>
          )}        
        </motion.div>
      </div>
    </div>
  );
}
