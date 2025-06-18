
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
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
  Settings,
  Users
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { hapticFeedback } from '@/lib/haptics';
import { useStellarAccount } from '@/hooks/useStellarAccount';
import { useRealTimeExchangeRates } from '@/hooks/useRealTimeExchangeRates';
import { toast } from 'sonner';
import { FavoriteRecipient } from '@/types/favoriteRecipient';
import { ContactPicker } from '@/components/contacts/ContactPicker';
import { TransactionConfirmationModal } from '@/components/payment/TransactionConfirmationModal';
import { sendPayment } from '@/lib/stellar/payment';

const ModernPayments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { balance, isSending } = useStellarAccount();
  const { rates, isLoading: ratesLoading } = useRealTimeExchangeRates();
  
  const [recipient, setRecipient] = useState<FavoriteRecipient | null>(null);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const xlmBalance = balance && balance.length > 0 ? parseFloat(balance[0].balance) : 0;
  const currentRate = rates[currency as keyof typeof rates] || 0;
  const fiatBalance = xlmBalance * currentRate;

  // Handle contact selection from navigation state
  useEffect(() => {
    if (location.state?.selectedContact) {
      setRecipient(location.state.selectedContact);
      // Clear the state to prevent re-setting on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleBack = () => {
    hapticFeedback('light');
    navigate(-1);
  };

  const handleContactSelect = (contact: FavoriteRecipient) => {
    setRecipient(contact);
    setShowContactPicker(false);
    hapticFeedback('light');
  };

  const validateForm = () => {
    if (!recipient) {
      toast.error('Please select a recipient');
      return false;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    
    const amountNum = parseFloat(amount);
    if (amountNum > fiatBalance) {
      toast.error('Insufficient funds');
      return false;
    }
    
    if (!recipient.stellar_address || !recipient.stellar_address.startsWith('G')) {
      toast.error('Invalid recipient Stellar address');
      return false;
    }
    
    return true;
  };

  const handleSendPayment = () => {
    if (!validateForm()) return;
    
    hapticFeedback('medium');
    setShowConfirmation(true);
  };

  const executePayment = async () => {
    if (!recipient || !amount) return;
    
    setIsProcessing(true);
    
    try {
      const amountNum = parseFloat(amount);
      const xlmAmount = currentRate > 0 ? (amountNum / currentRate).toFixed(7) : '0';
      
      const result = await sendPayment(
        recipient.stellar_address,
        xlmAmount,
        'XLM',
        recipient.recipient_name,
        recipient.id,
        memo || `Payment of ${amount} ${currency}`,
        {
          recipient_country: recipient.country,
          transfer_purpose: 'personal',
          transfer_category: 'money_transfer'
        }
      );
      
      if (result.success) {
        toast.success(`Successfully sent ${amount} ${currency} to ${recipient.recipient_name}`);
        hapticFeedback('success');
        
        // Reset form
        setRecipient(null);
        setAmount('');
        setMemo('');
        setShowConfirmation(false);
        
        // Navigate back after success
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
      hapticFeedback('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getXlmAmount = () => {
    if (!amount || currentRate === 0) return '0';
    return (parseFloat(amount) / currentRate).toFixed(7);
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
                {ratesLoading ? '...' : `${fiatBalance.toFixed(2)} ${currency}`}
              </div>
              <div className="text-sm text-white/60">
                {xlmBalance.toFixed(7)} XLM
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
                  Recipient
                </Label>
                {recipient ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 border border-white/20">
                    <div>
                      <div className="text-white font-medium">{recipient.recipient_name}</div>
                      <div className="text-white/60 text-sm">{recipient.relationship || 'Contact'}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRecipient(null)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowContactPicker(true)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Select Contact
                    </Button>
                  </div>
                )}
              </div>

              {/* Currency Selection */}
              <div className="space-y-2">
                <Label className="text-white/90">Currency</Label>
                <div className="flex gap-2">
                  {['EUR', 'USD', 'GBP'].map((curr) => (
                    <Button
                      key={curr}
                      variant={currency === curr ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrency(curr)}
                      className={currency === curr ? 
                        'bg-blue-600 text-white' : 
                        'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }
                    >
                      {curr}
                    </Button>
                  ))}
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
                    {currency}
                  </div>
                </div>
                {amount && currentRate > 0 && (
                  <div className="text-white/60 text-sm">
                    ≈ {getXlmAmount()} XLM
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
                    Network Fee
                  </span>
                  <span>0.00001 XLM (~$0.001)</span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated Time
                  </span>
                  <span>3-5 seconds</span>
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendPayment}
                disabled={isSending || isProcessing || !recipient || !amount || ratesLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 h-12"
              >
                {isSending || isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send {amount || '0.00'} {currency}
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

      {/* Contact Picker Modal */}
      {showContactPicker && (
        <ContactPicker
          onSelectContact={handleContactSelect}
          onClose={() => setShowContactPicker(false)}
        />
      )}

      {/* Transaction Confirmation Modal */}
      {showConfirmation && recipient && amount && (
        <TransactionConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={executePayment}
          recipient={recipient}
          amount={amount}
          currency={currency}
          xlmAmount={getXlmAmount()}
          memo={memo}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default ModernPayments;
