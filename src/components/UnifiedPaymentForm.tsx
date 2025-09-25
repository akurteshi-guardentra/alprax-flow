import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  User, 
  DollarSign, 
  MessageSquare,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hapticFeedback } from "@/lib/haptics";
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { useRealTimeExchangeRates } from "@/hooks/useRealTimeExchangeRates";
import { useEnhancedPayment } from "@/hooks/useEnhancedPayment";
import { toast } from "sonner";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { ContactPicker } from "@/components/contacts/ContactPicker";
import { CountrySelector } from "@/components/CountrySelector";
import { PaymentConfirmation } from "@/components/payment/PaymentConfirmation";
import { fundTestAccount } from "@/lib/stellar/payment";

interface PaymentFormData {
  recipient: FavoriteRecipient | null;
  amount: string;
  memo: string;
  currency: 'EUR' | 'USD' | 'GBP';
  country: string;
}

type PaymentStep = 'form' | 'confirmation' | 'processing' | 'success' | 'error';

export function UnifiedPaymentForm() {
  const navigate = useNavigate();
  const { balance, isFunding, fundAccount, publicKey } = useStellarAccount();
  const { rates, isLoading: ratesLoading } = useRealTimeExchangeRates();
  const { executePayment, validatePayment, isProcessing } = useEnhancedPayment();
  
  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
    recipient: null,
    amount: '',
    memo: '',
    currency: 'EUR',
    country: ''
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState<PaymentStep>('form');
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Calculated values
  const xlmBalance = balance && balance.length > 0 ? parseFloat(balance[0].balance) : 0;
  const currentRate = rates[formData.currency] || 0;
  const fiatBalance = xlmBalance * currentRate;

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
    setFormData(prev => ({ ...prev, recipient: contact }));
    if (contact.country) {
      setFormData(prev => ({ ...prev, country: contact.country }));
    }
    setShowContactPicker(false);
    hapticFeedback('light');
  };

  const updateFormField = <K extends keyof PaymentFormData>(
    field: K,
    value: PaymentFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.recipient) {
      return { valid: false, message: "Please select a recipient" };
    }
    
    if (!formData.recipient.stellar_address?.startsWith('G') || 
        formData.recipient.stellar_address.length !== 56) {
      return { valid: false, message: "Invalid recipient Stellar address" };
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return { valid: false, message: "Please enter a valid amount" };
    }
    
    const amountNum = parseFloat(formData.amount);
    if (amountNum > fiatBalance) {
      return { valid: false, message: `Insufficient funds. Available: ${fiatBalance.toFixed(2)} ${formData.currency}` };
    }
    
    if (!formData.memo.trim()) {
      return { valid: false, message: "Please enter a purpose for this transfer" };
    }
    
    if (!formData.country) {
      return { valid: false, message: "Please select a country" };
    }
    
    if (xlmBalance <= 0) {
      return { valid: false, message: "Your account needs to be funded with XLM" };
    }
    
    return { valid: true, message: "" };
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
    hapticFeedback('medium');
    
    try {
      const amountNum = parseFloat(formData.amount);
      const xlmAmount = currentRate > 0 ? (amountNum / currentRate).toFixed(7) : '0';
      
      const result = await executePayment({
        destinationAddress: formData.recipient.stellar_address,
        amount: xlmAmount,
        assetCode: 'XLM',
        recipientName: formData.recipient.recipient_name,
        recipientId: formData.recipient.id,
        memo: formData.memo,
        metadata: {
          recipient_country: formData.country,
          transfer_purpose: 'personal',
          transfer_category: 'money_transfer'
        }
      });
      
      if (result.success) {
        setTransactionId(result.txHash || `tx_${Date.now()}`);
        setCurrentStep('success');
        hapticFeedback('success');
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : 'Payment failed';
      
      // Check if it's an account not found error and offer recovery
      if (message.includes('account') && (message.includes('not found') || message.includes('does not exist'))) {
        setErrorMessage(`${message}\n\nWould you like to activate the recipient's account and retry?`);
        // Could add a retry button here in the error UI
      } else {
        setErrorMessage(message);
      }
      
      setCurrentStep('error');
      hapticFeedback('error');
    }
  };

  const handleActivateAndRetry = async () => {
    if (!formData.recipient?.stellar_address) return;
    
    try {
      setCurrentStep('processing');
      toast.info('Activating recipient account...');
      
      const fundingResult = await fundTestAccount(formData.recipient.stellar_address);
      
      if (fundingResult.success) {
        toast.success('Account activated! Retrying payment...');
        // Wait a moment for the account to be fully activated
        await new Promise(resolve => setTimeout(resolve, 2000));
        await executeTransaction();
      } else {
        throw new Error(fundingResult.error || 'Failed to activate account');
      }
    } catch (error) {
      console.error('Activation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to activate account';
      toast.error(message);
      setErrorMessage(`Account activation failed: ${message}`);
      setCurrentStep('error');
    }
  };

  const handleFundAccount = async () => {
    if (!publicKey) {
      toast.error('No Stellar account found');
      return;
    }
    
    try {
      await fundAccount();
      toast.success('Account funded successfully!');
    } catch (error) {
      console.error('Funding error:', error);
      toast.error('Failed to fund account');
    }
  };

  const resetForm = () => {
    setFormData({
      recipient: null,
      amount: '',
      memo: '',
      currency: 'EUR',
      country: ''
    });
    setCurrentStep('form');
    setTransactionId('');
    setErrorMessage('');
  };

  const getXlmAmount = () => {
    if (!formData.amount || currentRate === 0) return '0';
    return (parseFloat(formData.amount) / currentRate).toFixed(7);
  };

  const validation = validateForm();

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
              <h1 className="text-2xl font-bold text-white">
                {currentStep === 'form' && 'Send Payment'}
                {currentStep === 'confirmation' && 'Confirm Payment'}
                {currentStep === 'processing' && 'Processing...'}
                {currentStep === 'success' && 'Payment Sent!'}
                {currentStep === 'error' && 'Payment Failed'}
              </h1>
              <p className="text-white/70">
                {currentStep === 'form' && 'Send money instantly worldwide'}
                {currentStep === 'confirmation' && 'Review your transaction details'}
                {currentStep === 'processing' && 'Please wait while we process your payment'}
                {currentStep === 'success' && 'Your payment was sent successfully'}
                {currentStep === 'error' && 'Something went wrong with your payment'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Balance Display */}
        {currentStep === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="text-center py-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                    Available Balance
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-white">
                  {ratesLoading ? '...' : `${fiatBalance.toFixed(2)} ${formData.currency}`}
                </div>
                <div className="text-sm text-white/60">
                  {xlmBalance.toFixed(7)} XLM
                </div>
                {xlmBalance === 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-red-400">
                      ⚠️ Account needs funding to send payments
                    </div>
                    <Button
                      onClick={handleFundAccount}
                      disabled={isFunding || !publicKey}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-8"
                    >
                      {isFunding ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Adding Funds...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-2" />
                          Add Test Funds
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Recipient */}
                  <div className="space-y-2">
                    <Label className="text-white/90 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Recipient
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
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowContactPicker(true)}
                        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Select Contact
                      </Button>
                    )}
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label className="text-white/90">Country</Label>
                    <CountrySelector
                      value={formData.country}
                      onSelect={(country) => updateFormField('country', country || '')}
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label className="text-white/90 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Amount ({formData.currency})
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => updateFormField('amount', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    {formData.amount && currentRate > 0 && (
                      <div className="text-xs text-white/60">
                        ≈ {getXlmAmount()} XLM
                      </div>
                    )}
                  </div>

                  {/* Purpose */}
                  <div className="space-y-2">
                    <Label className="text-white/90 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Purpose
                    </Label>
                    <Input
                      placeholder="What's this payment for?"
                      value={formData.memo}
                      onChange={(e) => updateFormField('memo', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!validation.valid || isProcessing}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Continue
                      </>
                    )}
                  </Button>

                  {!validation.valid && validation.message && (
                    <div className="text-red-400 text-sm text-center">
                      {validation.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'confirmation' && formData.recipient && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PaymentConfirmation
                recipient={{
                  name: formData.recipient.recipient_name,
                  stellar_address: formData.recipient.stellar_address,
                  country: formData.country
                }}
                amount={formData.amount}
                currency={formData.currency}
                xlmAmount={getXlmAmount()}
                memo={formData.memo}
                onConfirm={executeTransaction}
                onBack={() => setCurrentStep('form')}
                isProcessing={isProcessing}
              />
            </motion.div>
          )}
          
           {currentStep === 'confirmation' && !formData.recipient && (
            <motion.div
              key="confirmation-error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-red-900/20 border-red-500/30 text-white">
                <CardContent className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <p className="text-red-300">No recipient selected</p>
                  <Button
                    onClick={() => setCurrentStep('form')}
                    className="mt-4 bg-red-600 hover:bg-red-700"
                  >
                    Back
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
                  <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
                  <p className="text-white/70">
                    Your payment is being processed on the Stellar network...
                  </p>
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
            >
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <h3 className="text-xl font-semibold mb-2">Payment Sent!</h3>
                  <p className="text-white/70 mb-4">
                    Successfully sent {formData.amount} {formData.currency} to {formData.recipient?.recipient_name}
                  </p>
                  <div className="text-xs text-white/50 mb-6">
                    Transaction ID: {transactionId}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={resetForm}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                    >
                      Send Another
                    </Button>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
                  <p className="text-red-400 mb-6">
                    {errorMessage}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setCurrentStep('form')}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Picker Modal */}
        {showContactPicker && (
          <ContactPicker
            onSelectContact={handleContactSelect}
            onClose={() => setShowContactPicker(false)}
          />
        )}
      </div>
    </div>
  );
}