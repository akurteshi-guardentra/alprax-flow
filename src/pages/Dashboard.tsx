import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SimplifiedPaymentFlow } from "@/components/transaction/SimplifiedPaymentFlow";
import { TestAccountView } from "@/components/stellar-account/TestAccountView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showTestAccounts, setShowTestAccounts] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 p-4 sm:p-6">
      <div className="container max-w-7xl mx-auto space-y-6 relative">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-slate-600 hover:bg-slate-200/50 dark:text-white dark:hover:bg-slate-700/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTestAccounts(!showTestAccounts)}
            className="text-slate-600 bg-white/80 border-slate-300 hover:bg-slate-100 dark:text-white dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
          >
            <Settings className="h-4 w-4 mr-1" />
            Test Accounts
          </Button>
        </div>
        
        <div className="flex flex-col items-start">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mt-4 mb-6">Alprax Dashboard</h1>
        </div>
        
        <div className={showTestAccounts ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : ""}>
          {showTestAccounts ? (
            <>
              {/* Test Account Management (only when showTestAccounts is true) */}
              <div className="lg:col-span-1">
                <Card className="border border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 dark:border-slate-700">
                  <CardContent className="p-4">
                    <TestAccountView />
                  </CardContent>
                </Card>
              </div>
              
              {/* Simplified Payment Flow */}
              <div className="lg:col-span-2">
                <SimplifiedPaymentFlow isMobile={isMobile} />
              </div>
            </>
          ) : (
            // Show only the payment flow when not showing test accounts
            <SimplifiedPaymentFlow isMobile={isMobile} />
          )}        </div>
      </div>
    </div>
  );
}
