import { useState, useEffect, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Send, 
  User, 
  Euro,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wallet,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hapticFeedback } from "@/lib/haptics";
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { useRealTimeExchangeRates } from "@/hooks/useRealTimeExchangeRates";
import { toast } from "sonner";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { ContactPicker } from "@/components/contacts/ContactPicker";
import { CountrySelector } from "@/components/CountrySelector";
import { sendPayment } from "@/lib/stellar/payment";
import { useIsMobile } from "@/hooks/use-mobile";

type PaymentStep = 'form' | 'confirmation' | 'processing' | 'success' | 'error';

interface PaymentData {
  recipient: FavoriteRecipient | null;
  amount: string;
  memo: string;
  country: string;
}

export const FiatPaymentForm = memo(function FiatPaymentForm() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { balance, isFunding, fundAccount, publicKey } = useStellarAccount();
  const { rates, isLoading: ratesLoading } = useRealTimeExchangeRates();
  
  // Form state
  const [formData, setFormData] = useState<PaymentData>({
    recipient: null,
    amount: '',
    memo: '',
    country: ''
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState<PaymentStep>('form');
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Hide blockchain complexity - only show fiat values
  const xlmBalance = useMemo(() => 
    balance && balance.length > 0 ? parseFloat(balance[0].balance) : 0, 
    [balance]
  );
  const currentRate = useMemo(() => rates['EUR'] || 0, [rates]);
  const fiatBalance = useMemo(() => xlmBalance * currentRate, [xlmBalance, currentRate]);

  const updateFormField = <K extends keyof PaymentData>(
    field: K,
    value: PaymentData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    hapticFeedback('light');
  };

  const validateForm = () => {
    if (!formData.recipient) {
      return { valid: false, message: "Please select a recipient" };
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return { valid: false, message: "Please enter a valid amount" };
    }
    
    const amountNum = parseFloat(formData.amount);
    if (amountNum > fiatBalance) {
      return { valid: false, message: `Insufficient funds. Available: €${fiatBalance.toFixed(2)}` };
    }
    
    if (!formData.memo.trim()) {
      return { valid: false, message: "Please enter a purpose for this transfer" };
    }
    
    if (!formData.country) {
      return { valid: false, message: "Please select a country" };
    }
    
    return { valid: true, message: "" };
  };

  const handleBack = () => {
    if (currentStep === 'form') {
      navigate(-1);
    } else {
      setCurrentStep('form');
      setErrorMessage('');
    }
    hapticFeedback('light');
  };

  const handleContactSelect = (contact: FavoriteRecipient) => {
    updateFormField('recipient', contact);
    if (contact.country) {
      updateFormField('country', contact.country);
    }
    setShowContactPicker(false);
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      toast.error(validation.message);
      hapticFeedback('error');
      return;
    }
    
    setCurrentStep('confirmation');
    hapticFeedback('medium');
  };

  const executeTransaction = async () => {
    if (!formData.recipient) return;
    
    setCurrentStep('processing');
    setIsProcessing(true);
    hapticFeedback('medium');
    
    try {
      const amountNum = parseFloat(formData.amount);
      // Convert EUR to XLM behind the scenes
      const xlmAmount = currentRate > 0 ? (amountNum / currentRate).toFixed(7) : '0';
      
      const result = await sendPayment(
        formData.recipient.stellar_address,
        xlmAmount,
        'XLM',
        formData.recipient.recipient_name,
        formData.recipient.id,
        formData.memo,
        {
          recipient_country: formData.country,
          transfer_purpose: 'personal',
          transfer_category: 'money_transfer'
        }
      );
      
      if (result.success) {
        setTransactionId(result.txHash || `tx_${Date.now()}`);
        setCurrentStep('success');
        hapticFeedback('success');
        toast.success('Money sent successfully!');
      } else {
        throw new Error(result.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      const message = error instanceof Error ? error.message : 'Transfer failed';
      setErrorMessage(message);
      setCurrentStep('error');
      hapticFeedback('error');
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFundAccount = async () => {
    if (!publicKey) {
      toast.error('Account not found');
      return;
    }
    
    try {
      await fundAccount();
      toast.success('Account topped up successfully!');
    } catch (error) {
      console.error('Funding error:', error);
      toast.error('Failed to add funds');
    }
  };

  const resetForm = () => {
    setFormData({
      recipient: null,
      amount: '',
      memo: '',
      country: ''
    });
    setCurrentStep('form');
    setTransactionId('');
    setErrorMessage('');
  };

  return (
    <div className={`min-h-screen mobile-viewport ${isMobile ? 'mobile-nav-spacing' : ''} relative`}>
      <div className="mobile-container pt-safe">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-white/10 touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="mobile-title text-white">
              {currentStep === 'form' && 'Send Money'}
              {currentStep === 'confirmation' && 'Confirm Transfer'}
              {currentStep === 'processing' && 'Sending...'}
              {currentStep === 'success' && 'Money Sent!'}
              {currentStep === 'error' && 'Transfer Failed'}
            </h1>
            <p className="mobile-subtitle text-white/70">
              {currentStep === 'form' && 'Send money to family and friends worldwide'}
              {currentStep === 'confirmation' && 'Review your transfer details'}
              {currentStep === 'processing' && 'Your money is on its way'}
              {currentStep === 'success' && 'Your money was sent successfully'}
              {currentStep === 'error' && 'Something went wrong'}
            </p>
          </div>
        </motion.div>

        {/* Balance Card - Only show EUR amount */}
        {currentStep === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="card-mobile">
              <CardContent className="text-center py-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/70">Available Balance</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {ratesLoading ? '...' : `€${fiatBalance.toFixed(2)}`}
                </div>
                {fiatBalance === 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-red-400">
                      ⚠️ Add money to start sending
                    </div>
                    <Button
                      onClick={handleFundAccount}
                      disabled={isFunding || !publicKey}
                      className="btn-mobile-primary h-8 text-sm"
                    >
                      {isFunding ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Adding Money...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-2" />
                          Add Money
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Contact Picker Modal */}
        {showContactPicker && (
          <ContactPicker
            onClose={() => setShowContactPicker(false)}
            onSelectContact={handleContactSelect}
          />
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="card-mobile">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Send className="w-5 h-5" />
                    Transfer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="form-mobile">
                  {/* Recipient */}
                  <div className="input-group">
                    <Label className="label-mobile">
                      <User className="w-4 h-4" />
                      Send to
                    </Label>
                    {formData.recipient ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 border border-white/20">
                        <div>
                          <div className="text-white font-medium">{formData.recipient.recipient_name}</div>
                          <div className="text-white/60 text-sm">{formData.recipient.relationship || 'Contact'}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateFormField('recipient', null)}
                          className="text-white/70 hover:text-white hover:bg-white/10 touch-target"
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowContactPicker(true)}
                        className="btn-mobile-secondary w-full"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Choose recipient
                      </Button>
                    )}
                  </div>

                  {/* Country */}
                  <div className="input-group">
                    <Label className="label-mobile">Destination country</Label>
                    <CountrySelector
                      value={formData.country}
                      onSelect={(country) => updateFormField('country', country || '')}
                    />
                  </div>

                  {/* Amount */}
                  <div className="input-group">
                    <Label className="label-mobile">
                      <Euro className="w-4 h-4" />
                      Amount
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => updateFormField('amount', e.target.value)}
                        className="input-mobile pl-8"
                      />
                      <Euro className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-white/50" />
                    </div>
                    {formData.amount && (
                      <div className="text-xs text-white/60">
                        {formData.recipient?.recipient_name} will receive €{formData.amount}
                      </div>
                    )}
                  </div>

                  {/* Purpose */}
                  <div className="input-group">
                    <Label className="label-mobile">
                      <MessageSquare className="w-4 h-4" />
                      What's this for?
                    </Label>
                    <Input
                      placeholder="e.g. Family support, gift, etc."
                      value={formData.memo}
                      onChange={(e) => updateFormField('memo', e.target.value)}
                      className="input-mobile"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleSubmit}
                disabled={!validateForm().valid || isProcessing}
                className="btn-mobile-primary w-full"
              >
                Continue
              </Button>
            </motion.div>
          )}

          {currentStep === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="card-mobile">
                <CardHeader>
                  <CardTitle className="text-white">Transfer Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">To:</span>
                    <span className="font-medium text-white">{formData.recipient?.recipient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Country:</span>
                    <span className="font-medium text-white">{formData.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Amount:</span>
                    <span className="font-medium text-white">€{formData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Purpose:</span>
                    <span className="font-medium text-white">{formData.memo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">They receive:</span>
                    <span className="font-bold text-white text-lg">€{formData.amount}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={executeTransaction}
                  disabled={isProcessing}
                  className="btn-mobile-primary w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Money...
                    </>
                  ) : (
                    'Send Money'
                  )}
                </Button>
                <Button
                  onClick={() => setCurrentStep('form')}
                  variant="outline"
                  className="w-full border-white/20 bg-transparent hover:bg-white/10 text-white"
                >
                  Go Back
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <Card className="card-mobile">
                <CardContent className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-white" />
                  <h3 className="text-lg font-semibold text-white mb-2">Sending your money</h3>
                  <p className="text-white/70">This usually takes a few seconds...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <Card className="card-mobile">
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <h3 className="text-lg font-semibold text-white mb-2">Money sent successfully!</h3>
                  <p className="text-white/70 mb-4">
                    €{formData.amount} was sent to {formData.recipient?.recipient_name}
                  </p>
                  {transactionId && (
                    <p className="text-xs text-white/50 font-mono">
                      ID: {transactionId.slice(0, 16)}...
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={resetForm}
                  className="btn-mobile-primary w-full"
                >
                  Send More Money
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full border-white/20 bg-transparent hover:bg-white/10 text-white"
                >
                  Back to Home
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <Card className="card-mobile">
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <h3 className="text-lg font-semibold text-white mb-2">Transfer failed</h3>
                  <p className="text-white/70 mb-4">{errorMessage}</p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={() => setCurrentStep('form')}
                  className="btn-mobile-primary w-full"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full border-white/20 bg-transparent hover:bg-white/10 text-white"
                >
                  Back to Home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});