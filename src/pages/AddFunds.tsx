
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { useNavigate } from "react-router-dom";
import { Plus, CreditCard, Building, Wallet } from "lucide-react";
import { toast } from "sonner";

const AddFunds = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("card");

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Instant transfer",
      fee: "2.9% + $0.30"
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: Building,
      description: "1-3 business days",
      fee: "Free"
    },
    {
      id: "wallet",
      name: "Digital Wallet",
      icon: Wallet,
      description: "Instant transfer",
      fee: "1.5%"
    }
  ];

  const handleAddFunds = () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    toast.info("Redirecting to payment processor...");
    // Here you would integrate with actual payment processing
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
                />
              </div>

              <div>
                <label className="text-white/90 text-sm font-medium mb-4 block">Payment Method</label>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${
                          selectedMethod === method.id 
                            ? 'glass-card border-blue-500/50 bg-blue-500/10' 
                            : 'glass-card hover:bg-white/5'
                        }`}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 rounded-full bg-white/10">
                                <method.icon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{method.name}</p>
                                <p className="text-sm text-white/60">{method.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-white">{method.fee}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleAddFunds}
                className="w-full premium-button h-12"
                disabled={!amount}
              >
                Add ${amount || '0.00'} to Account
              </Button>
            </CardContent>
          </Card>

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
