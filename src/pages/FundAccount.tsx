
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CreditCard, 
  Landmark, 
  Smartphone, 
  Wallet,
  DollarSign,
  Info,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { useStellarAccount } from '@/hooks/useStellarAccount';
import { FiatDisplay } from '@/components/currency/FiatDisplay';
import { toast } from 'sonner';

const FundAccount = () => {
  const navigate = useNavigate();
  const { balance } = useStellarAccount();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const accountBalance = balance && balance.length > 0 ? balance[0].balance : "0";
  const quickAmounts = [25, 50, 100, 500];

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handlePaymentComplete = () => {
    toast.success('Funding completed successfully!');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const fundingMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Instant funding with any major card',
      processingTime: 'Instant',
      fees: '2.9% + $0.30',
      color: 'from-blue-600 to-blue-400'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Landmark,
      description: 'Low-cost ACH transfer from your bank',
      processingTime: '1-3 business days',
      fees: '$0.25 flat fee',
      color: 'from-green-600 to-green-400'
    },
    {
      id: 'crypto',
      name: 'Crypto Wallet',
      icon: Wallet,
      description: 'Fund with Bitcoin, Ethereum, or USDC',
      processingTime: '10-30 minutes',
      fees: 'Network fees only',
      color: 'from-orange-600 to-orange-400'
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'Use M-Pesa, Airtel Money, or other mobile wallets',
      processingTime: '5-15 minutes',
      fees: '1.5%',
      color: 'from-purple-600 to-purple-400'
    }
  ];

  return (
    <div className="min-h-screen modern-gradient p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Fund Your Account</h1>
            <p className="text-white/70">Add money to your Alprax wallet</p>
          </div>
        </motion.div>

        {/* Current Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card modern-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Current Balance</p>
                  <div className="text-2xl font-bold text-white">
                    <FiatDisplay xlmAmount={accountBalance} currency="USD" />
                  </div>
                </div>
                <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                  Available
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amount Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card modern-shadow h-fit">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Amount to Fund
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/90">Enter Amount (USD)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/90">Quick Amounts</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        onClick={() => handleQuickAmount(quickAmount)}
                        className="bg-white/5 border-white/20 text-white hover:bg-white/20"
                      >
                        ${quickAmount}
                      </Button>
                    ))}
                  </div>
                </div>

                {amount && (
                  <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-300 text-sm">
                      <Info className="w-4 h-4" />
                      <span>You'll receive approximately ${amount} in your wallet</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card modern-shadow">
              <CardHeader>
                <CardTitle className="text-white">Choose Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethodSelector 
                  onSelect={setSelectedMethod}
                  selected={selectedMethod}
                  amount={parseFloat(amount) * 100 || 2500} // Convert to cents
                  onPaymentComplete={handlePaymentComplete}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Funding Methods Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card modern-shadow">
            <CardHeader>
              <CardTitle className="text-white">Funding Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fundingMethods.map((method) => (
                  <div
                    key={method.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full bg-gradient-to-r ${method.color}`}>
                        <method.icon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-white font-medium">{method.name}</h3>
                    </div>
                    <p className="text-white/70 text-sm mb-3">{method.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-white/60">
                        <Clock className="w-3 h-3" />
                        {method.processingTime}
                      </span>
                      <span className="text-white/60">{method.fees}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FundAccount;
