
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { useNavigate } from "react-router-dom";
import { Plus, CreditCard, Building, Wallet, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import { useFundingIntegration } from "@/hooks/useFundingIntegration";

const AddFunds = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [step, setStep] = useState<'amount' | 'method' | 'success'>('amount');
  const { isProcessing } = useFundingIntegration();

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  const handleAmountConfirm = () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amountValue < 1) {
      toast.error("Minimum amount is $1.00");
      return;
    }

    if (amountValue > 10000) {
      toast.error("Maximum amount is $10,000.00");
      return;
    }

    setStep('method');
  };

  const handlePaymentComplete = () => {
    setStep('success');
    toast.success(`Successfully added $${amount} to your account!`);
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  return (
    <UnifiedLayout 
      showBackButton 
      onBack={() => navigate('/dashboard')}
      title="Add Funds"
      subtitle="Top up your AlpraxFlow balance"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {step === 'amount' && (
            <Card className="glass-card modern-shadow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-400" />
                  Add Funds to Your Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-white/90 text-sm font-medium mb-2 block">Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="modern-input text-2xl h-14"
                    min="1"
                    max="10000"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="text-white/90 text-sm font-medium mb-4 block">Quick Amounts</label>
                  <div className="grid grid-cols-3 gap-3">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        onClick={() => setAmount(quickAmount.toString())}
                        className="glass-card border-white/20 text-white hover:bg-white/10"
                      >
                        ${quickAmount}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleAmountConfirm}
                  className="w-full premium-button h-12"
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  Continue with ${amount || '0.00'}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'method' && (
            <Card className="glass-card modern-shadow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  Choose Payment Method
                </CardTitle>
                <p className="text-white/70">Adding ${amount} to your account</p>
              </CardHeader>
              <CardContent>
                <PaymentMethodSelector
                  onSelect={setSelectedMethod}
                  selected={selectedMethod}
                  amount={parseFloat(amount)}
                  onPaymentComplete={handlePaymentComplete}
                />
                
                <Button 
                  variant="outline"
                  onClick={() => setStep('amount')}
                  className="w-full mt-4 glass-card border-white/20 text-white hover:bg-white/10"
                >
                  Back to Amount
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'success' && (
            <Card className="glass-card modern-shadow">
              <CardContent className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Funds Added Successfully!</h3>
                <p className="text-white/70 mb-4">${amount} has been added to your account</p>
                <p className="text-sm text-white/60">Redirecting to dashboard...</p>
              </CardContent>
            </Card>
          )}

          <Card className="glass-card modern-shadow border-yellow-500/25">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-white/90 text-sm font-medium">Security Notice</p>
                  <p className="text-white/70 text-sm">
                    Your payment information is encrypted and processed securely. 
                    We never store your payment details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};

export default AddFunds;
