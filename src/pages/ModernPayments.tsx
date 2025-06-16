import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { AlpraxBrandHeader } from '@/components/brand/AlpraxLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  User, 
  DollarSign, 
  MessageSquare,
  CreditCard,
  Clock,
  Shield,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hapticFeedback } from '@/lib/haptics';
import { useStellarAccount } from '@/hooks/useStellarAccount';
import { toast } from 'sonner';

const ModernPayments = () => {
  const navigate = useNavigate();
  const { sendPayment, isSending, balance } = useStellarAccount();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [currency, setCurrency] = useState('USD');

  const xlmBalance = balance && balance.length > 0 ? parseFloat(balance[0].balance) : 0;
  const usdBalance = xlmBalance * 0.12; // Mock conversion rate

  const handleBack = () => {
    hapticFeedback('light');
    navigate(-1);
  };

  const handleSendPayment = async () => {
    if (!recipient || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (numAmount > usdBalance) {
      toast.error('Insufficient funds');
      return;
    }

    hapticFeedback('medium');
    
    // Convert USD to XLM for backend processing
    const xlmAmount = (numAmount / 0.12).toFixed(7);
    
    try {
      await sendPayment({
        destination: recipient,
        amount: xlmAmount,
        memo: memo || `Payment of $${amount} USD`,
        recipientName: 'Recipient'
      });
      
      // Reset form
      setRecipient('');
      setAmount('');
      setMemo('');
      
      toast.success(`Successfully sent $${amount} USD`);
      
      // Navigate back after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Send Payment</h1>
              <p className="text-white/70">Send money instantly worldwide</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/payment-methods')}
            className="text-white hover:bg-white/10"
            title="Payment Methods"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Balance Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ModernCard variant="glass">
            <ModernCardContent className="text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                  Available Balance
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">
                ${usdBalance.toFixed(2)} USD
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>

        {/* Payment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ModernCard variant="gradient">
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Payment Details
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-6">
              {/* Recipient */}
              <div className="space-y-2">
                <Label className="text-white/90 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Recipient Address
                </Label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient's wallet address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/contacts')}
                    className="text-blue-400 hover:text-blue-300 hover:bg-white/10 text-xs"
                  >
                    Choose from contacts
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label className="text-white/90 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 text-sm">
                    USD
                  </div>
                </div>
                {amount && (
                  <div className="text-white/60 text-sm">
                    ≈ {(parseFloat(amount) / 0.12).toFixed(7)} XLM
                  </div>
                )}
              </div>

              {/* Memo */}
              <div className="space-y-2">
                <Label className="text-white/90 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message (Optional)
                </Label>
                <Input
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Add a note for this payment"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              {/* Fee Information */}
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-white/80">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Processing Fee
                  </span>
                  <span>$0.01</span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated Time
                  </span>
                  <span>3-5 seconds</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex items-center justify-between text-white font-semibold">
                    <span>Total</span>
                    <span>${amount ? (parseFloat(amount) + 0.01).toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendPayment}
                disabled={isSending || !recipient || !amount}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 h-12"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send ${amount || '0.00'} USD
                  </>
                )}
              </Button>

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-white/80">
                  <div className="font-medium text-blue-400 mb-1">Secure Transaction</div>
                  All payments are protected by blockchain technology and encrypted end-to-end.
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernPayments;
