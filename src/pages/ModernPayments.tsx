
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
  Users,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { hapticFeedback } from '@/lib/haptics';
import { useStellarAccount } from '@/hooks/useStellarAccount';
import { useRealTimeExchangeRates } from '@/hooks/useRealTimeExchangeRates';
import { toast } from 'sonner';
import { FavoriteRecipient } from '@/types/favoriteRecipient';
import { ContactPicker } from '@/components/contacts/ContactPicker';
import { TransactionConfirmationModal } from '@/components/payment/TransactionConfirmationModal';
import { PaymentErrorBoundary } from '@/components/payment/PaymentErrorBoundary';
import { PaymentStatusIndicator, PaymentStatus } from '@/components/payment/PaymentStatusIndicator';
import { validatePaymentForm } from '@/components/payment/PaymentFormValidation';
import { sendPayment } from '@/lib/stellar/payment';
import { PaymentFormData } from '@/types/payment';
import { CountrySelector } from '@/components/CountrySelector';

const ModernPayments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { balance, isSending } = useStellarAccount();
  const { rates, isLoading: ratesLoading } = useRealTimeExchangeRates();
  
  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
    recipient: null,
    amount: '',
    memo: '',
    currency: 'EUR'
  });
  
  // Add country state
  const [countryCode, setCountryCode] = useState<string>('');
  
  // UI state
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Calculated values
  const xlmBalance = balance && balance.length > 0 ? parseFloat(balance[0].balance) : 0;
  const currentRate = rates[formData.currency] || 0;
  const fiatBalance = xlmBalance * currentRate;

  // Debug logging
  useEffect(() => {
    console.log('ModernPayments Debug:', {
      formData,
      countryCode,
      xlmBalance,
      currentRate,
      fiatBalance,
      ratesLoading
    });
  }, [formData, countryCode, xlmBalance, currentRate, fiatBalance, ratesLoading]);

  // Handle contact selection from navigation state
  useEffect(() => {
    if (location.state?.selectedContact) {
      setFormData(prev => ({ ...prev, recipient: location.state.selectedContact }));
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleBack = () => {
    hapticFeedback('light');
    navigate(-1);
  };

  const handleContactSelect = (contact: FavoriteRecipient) => {
    setFormData(prev => ({ ...prev, recipient: contact }));
    setShowContactPicker(false);
    // Auto-set country from recipient if available
    if (contact.country) {
      setCountryCode(contact.country);
    }
    hapticFeedback('light');
  };

  const updateFormField = <K extends keyof PaymentFormData>(
    field: K,
    value: PaymentFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendPayment = () => {
    console.log('Send Payment clicked - validating form...');
    
    setPaymentStatus('validating');
    setStatusMessage('Validating payment details...');
    
    const validation = validatePaymentForm(
      formData.recipient, 
      formData.amount, 
      fiatBalance, 
      currentRate
    );
    
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0] || 'Please check your payment details';
      console.log('Validation failed:', errorMessage);
      toast.error(errorMessage);
      setPaymentStatus('error');
      setStatusMessage(errorMessage);
      hapticFeedback('error');
      return;
    }
    
    // Additional check for country if recipient doesn't have one
    if (!countryCode && (!formData.recipient?.country)) {
      console.log('Country required but not provided');
      toast.error('Please select a country');
      setPaymentStatus('error');
      setStatusMessage('Please select a country');
      hapticFeedback('error');
      return;
    }
    
    console.log('All validations passed, opening confirmation');
    setPaymentStatus('idle');
    setStatusMessage('');
    hapticFeedback('medium');
    setShowConfirmation(true);
  };

  const executePayment = async () => {
    if (!formData.recipient || !formData.amount) return;
    
    setPaymentStatus('processing');
    setStatusMessage('Processing payment on Stellar network...');
    
    try {
      const amountNum = parseFloat(formData.amount);
      const xlmAmount = currentRate > 0 ? (amountNum / currentRate).toFixed(7) : '0';
      
      const result = await sendPayment(
        formData.recipient.stellar_address,
        xlmAmount,
        'XLM',
        formData.recipient.recipient_name,
        formData.recipient.id,
        formData.memo || `Payment of ${formData.amount} ${formData.currency}`,
        {
          recipient_country: countryCode || formData.recipient.country,
          transfer_purpose: 'personal',
          transfer_category: 'money_transfer'
        }
      );
      
      if (result.success) {
        setPaymentStatus('success');
        setStatusMessage(`Successfully sent ${formData.amount} ${formData.currency}`);
        toast.success(`Successfully sent ${formData.amount} ${formData.currency} to ${formData.recipient.recipient_name}`);
        hapticFeedback('success');
        
        // Reset form
        setFormData({
          recipient: null,
          amount: '',
          memo: '',
          currency: 'EUR'
        });
        setCountryCode('');
        setShowConfirmation(false);
        
        // Navigate back after success
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentStatus('error');
      setStatusMessage(errorMessage);
      toast.error(errorMessage);
      hapticFeedback('error');
    }
  };

  const getXlmAmount = () => {
    if (!formData.amount || currentRate === 0) return '0';
    return (parseFloat(formData.amount) / currentRate).toFixed(7);
  };

  // Form validation for UI feedback
  const validation = validatePaymentForm(formData.recipient, formData.amount, fiatBalance, currentRate);
  
  // Enhanced validation check
  const isFormValid = validation.isValid && 
    (countryCode || formData.recipient?.country) && 
    xlmBalance > 0 && 
    !ratesLoading;

  console.log('Form validation state:', {
    validationResult: validation,
    countryCode,
    recipientCountry: formData.recipient?.country,
    xlmBalance,
    ratesLoading,
    isFormValid
  });

  return (
    <PaymentErrorBoundary>
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
                  {ratesLoading ? '...' : `${fiatBalance.toFixed(2)} ${formData.currency}`}
                </div>
                <div className="text-sm text-white/60">
                  {xlmBalance.toFixed(7)} XLM
                </div>
                {xlmBalance === 0 && (
                  <div className="text-xs text-red-400 mt-1">
                    ⚠️ Account needs funding to send payments
                  </div>
                )}
              </ModernCardContent>
            </ModernCard>
          </motion.div>

          {/* Payment Status */}
          <PaymentStatusIndicator status={paymentStatus} message={statusMessage} />

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
                  {validation.errors.recipient && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.recipient}
                    </div>
                  )}
                </div>

                {/* Country Selection */}
                <div className="space-y-2">
                  <Label className="text-white/90">Country</Label>
                  <CountrySelector
                    value={countryCode || formData.recipient?.country || ''}
                    onSelect={setCountryCode}
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  />
                  {!countryCode && !formData.recipient?.country && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-3 h-3" />
                      Please select a country
                    </div>
                  )}
                </div>

                {/* Currency Selection */}
                <div className="space-y-2">
                  <Label className="text-white/90">Currency</Label>
                  <div className="flex gap-2">
                    {(['EUR', 'USD', 'GBP'] as const).map((curr) => (
                      <Button
                        key={curr}
                        variant={formData.currency === curr ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateFormField('currency', curr)}
                        className={formData.currency === curr ? 
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
                      value={formData.amount}
                      onChange={(e) => updateFormField('amount', e.target.value)}
                      placeholder="0.00"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-16"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 text-sm">
                      {formData.currency}
                    </div>
                  </div>
                  {formData.amount && currentRate > 0 && (
                    <div className="text-white/60 text-sm">
                      ≈ {getXlmAmount()} XLM
                    </div>
                  )}
                  {validation.errors.amount && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.amount}
                    </div>
                  )}
                  {validation.errors.balance && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.balance}
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
                    value={formData.memo}
                    onChange={(e) => updateFormField('memo', e.target.value)}
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
                  disabled={!isFormValid || isSending || paymentStatus === 'processing'}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send {formData.amount || '0.00'} {formData.currency}
                    </>
                  )}
                </Button>

                {/* Debug info (remove in production) */}
                {!isFormValid && (
                  <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
                    Debug: Button disabled because:
                    {!validation.isValid && ' • Form validation failed'}
                    {!countryCode && !formData.recipient?.country && ' • Country required'}
                    {xlmBalance <= 0 && ' • Insufficient XLM balance'}
                    {ratesLoading && ' • Exchange rates loading'}
                  </div>
                )}

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
        {showConfirmation && formData.recipient && formData.amount && (
          <TransactionConfirmationModal
            isOpen={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={executePayment}
            recipient={formData.recipient}
            amount={formData.amount}
            currency={formData.currency}
            xlmAmount={getXlmAmount()}
            memo={formData.memo}
            isProcessing={paymentStatus === 'processing'}
          />
        )}
      </div>
    </PaymentErrorBoundary>
  );
};

export default ModernPayments;
