
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SimplifiedPaymentFlow } from "@/components/transaction/SimplifiedPaymentFlow";
import { TestAccountView } from "@/components/stellar-account/TestAccountView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showTestAccounts, setShowTestAccounts] = React.useState(false);

  return (
    <div className="min-h-screen modern-gradient p-4 sm:p-6 relative overflow-hidden">
      {/* Premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
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
            Test Accounts
          </Button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-start"
        >
          <h1 className="text-3xl font-bold text-gradient-modern mt-4 mb-6">Alprax Dashboard</h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={showTestAccounts ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : ""}
        >
          {showTestAccounts ? (
            <>
              <div className="lg:col-span-1">
                <Card className="glass-card modern-shadow">
                  <CardContent className="p-4">
                    <TestAccountView />
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <SimplifiedPaymentFlow isMobile={isMobile} />
              </div>
            </>
          ) : (
            <SimplifiedPaymentFlow isMobile={isMobile} />
          )}        
        </motion.div>
      </div>
    </div>
  );
}
