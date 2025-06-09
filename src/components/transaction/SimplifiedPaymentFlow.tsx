// Integration component for the simplified payment flow
import { useState, useEffect } from 'react';
import { useStellarAccount } from '@/hooks/useStellarAccount';
import { UserProfileService } from '@/services/UserProfileService';
import { SimplifiedPaymentForm } from './SimplifiedPaymentForm';
import { EnhancedTransactionHistory } from './EnhancedTransactionHistory';
import { useTransactionSubmission } from '@/hooks/useTransactionSubmission';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Wallet, ChevronDown, Activity, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';

interface PaymentFlowProps {
  isMobile: boolean;
}

export function SimplifiedPaymentFlow({ isMobile }: PaymentFlowProps) {
  // Get account details and balance
  const { account, balance, sendPayment, isSending } = useStellarAccount();
  const { fiatRate, defaultFiat } = useTransactionSubmission();
  const [availableFunds, setAvailableFunds] = useState(0);
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');

  // Effect to update available funds from balance
  useEffect(() => {
    if (balance && balance.length > 0) {
      try {
        setAvailableFunds(parseFloat(balance[0].balance));
      } catch (error) {
        console.error("Error parsing balance:", error);
        setAvailableFunds(0);
      }
    } else {
      setAvailableFunds(0);
    }
  }, [balance]);  // Handle payment submission - simplified to work with the mutation
  const handlePaymentSubmit = async (
    destination: string,
    amount: string,
    memo: string,
    recipientInfo: { name?: string; id?: string }
  ): Promise<{ success: boolean; hash?: string; error?: string }> => {
    if (!account) {
      toast.error("Account not set up yet");
      return { success: false, error: "Account not set up" };
    }

    // Call the sendPayment mutation - it handles its own success/error through toast messages
    sendPayment({
      destination,
      amount,
      memo,
      recipientName: recipientInfo.name,
      recipientId: recipientInfo.id
    });

    // Return success immediately since the mutation handles the actual result
    // The form will show loading state while isSending is true
    return { success: true };
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'send' | 'history');
    hapticFeedback('light');
  };

  // If no account is set up yet, show a message
  if (!account) {
    return (
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mb-4" />
          <p className="text-white/70 text-center">
            Loading your account details...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Rendering the component
  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-xl font-semibold text-white">
              <Wallet className="mr-2 h-5 w-5 text-blue-400" />
              Your Balance
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>          <div className="flex flex-col items-center text-center">            <div className="text-3xl font-bold text-white mb-2">
              {fiatRate > 0 
                ? `${(availableFunds * fiatRate).toFixed(2)} ${defaultFiat}`
                : `-- ${defaultFiat}` // Show placeholder when rate is loading
              }
            </div><Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
              Secure Account
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-white/70 bg-transparent border-white/20 hover:bg-white/10"
              onClick={() => setShowBalanceDetails(!showBalanceDetails)}
            >
              Account Details <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${showBalanceDetails ? 'rotate-180' : ''}`} />
            </Button>
            
            {showBalanceDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full mt-4"
              >
                <div className="p-3 bg-white/5 rounded border border-white/10 text-left">
                  <p className="text-white/60 text-sm mb-1">Network ID:</p>
                  <p className="text-white text-sm font-mono break-all">{account.publicKey}</p>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for Send Money and Transaction History */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-slate-800/60 border border-white/10 mb-4">
          <TabsTrigger value="send" className="data-[state=active]:bg-white/10 text-white">
            Send Money
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white/10 text-white">
            <Activity className="h-4 w-4 mr-1" />
            History
          </TabsTrigger>
        </TabsList>
          <TabsContent value="send" className="mt-0">
          <SimplifiedPaymentForm
            stellarAccount={account}
            availableFunds={availableFunds}
            isProcessing={isSending}
            onSubmitPayment={handlePaymentSubmit}
            isMobile={isMobile}
            defaultFiat={defaultFiat}
            fiatRate={fiatRate}
          />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <EnhancedTransactionHistory publicKey={account.publicKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
