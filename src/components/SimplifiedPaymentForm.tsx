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
  DollarSign, 
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
import { usePerformanceMetrics } from "@/hooks/use-performance-metrics";
import { usePullRefresh } from "@/hooks/use-pull-refresh";
import { useSwipeGesture } from "@/hooks/use-gestures";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh-indicator";
import { QRCodeScanner } from "@/components/mobile/QRCodeScanner";
import { BiometricAuth } from "@/components/mobile/BiometricAuth";

type PaymentStep = 'form' | 'confirmation' | 'processing' | 'success' | 'error';

interface PaymentData {
  recipient: FavoriteRecipient | null;
  amount: string;
  memo: string;
  country: string;
}

export const SimplifiedPaymentForm = memo(function SimplifiedPaymentForm() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { balance, isFunding, fundAccount, publicKey } = useStellarAccount();
  const { rates, isLoading: ratesLoading } = useRealTimeExchangeRates();
  const { measureRenderTime } = usePerformanceMetrics();
  
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
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Calculated values with memoization for performance
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
      return { valid: false, message: `Insufficient funds. Available: ${fiatBalance.toFixed(2)} EUR` };
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

  const handleQRScan = (data: string) => {
    // Create a recipient from QR code data
    const qrRecipient: FavoriteRecipient = {
      id: 'qr-' + Date.now(),
      stellar_address: data,
      recipient_name: 'QR Code Recipient',
      country: 'Unknown',
      currency: 'XLM',
      user_id: '',
      created_at: new Date().toISOString(),
      relationship: 'QR Code'
    };
    updateFormField('recipient', qrRecipient);
    setShowQRScanner(false);
    toast.success('QR code scanned successfully');
  };

  const handleBiometricSuccess = (method: string) => {
    setShowBiometricAuth(false);
    toast.success(`Authenticated with ${method}`);
    // Continue with payment after biometric auth
    executeTransaction();
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      toast.error(validation.message);
      hapticFeedback('error');
      return;
    }

    // For high-value transactions, require biometric authentication
    const amountNum = parseFloat(formData.amount);
    if (amountNum > 1000) {
      setShowBiometricAuth(true);
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
        toast.success('Payment sent successfully!');
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : 'Payment failed';
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
      country: ''
    });
    setCurrentStep('form');
    setTransactionId('');
    setErrorMessage('');
  };

  // Pull to refresh for balance updates
  const handleRefresh = async () => {
    try {
      // Force refresh balance and rates
      window.location.reload();
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  const {
    containerRef,
    isRefreshing,
    pullDistance,
    pullProgress,
    shouldShowRefreshIndicator,
    canRefresh
  } = usePullRefresh({
    onRefresh: handleRefresh,
    disabled: currentStep !== 'form'
  });

  // Swipe gestures for navigation
  const swipeRef = useSwipeGesture({
    onSwipeRight: () => {
      if (currentStep !== 'form') {
        handleBack();
      }
    },
    threshold: 100
  });

  const getXlmAmount = () => {
    if (!formData.amount || currentRate === 0) return '0';
    return (parseFloat(formData.amount) / currentRate).toFixed(7);
  };

  const validation = validateForm();

  // Performance measurement - simplified to avoid infinite re-renders
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      if (renderTime > 16.67) {
        console.warn(`Slow render in SimplifiedPaymentForm: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, []);

  return (
    <div 
      ref={(el) => {
        if (containerRef) containerRef.current = el;
        if (swipeRef) swipeRef.current = el;
      }}
      className={`min-h-screen mobile-viewport ${isMobile ? 'mobile-nav-spacing' : ''} relative`}
    >
      {/* Pull to refresh indicator */}
      <PullToRefreshIndicator
        isVisible={shouldShowRefreshIndicator}
        isRefreshing={isRefreshing}
        pullProgress={pullProgress}
        pullDistance={pullDistance}
        canRefresh={canRefresh}
      />
      
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
              {currentStep === 'form' && 'Send Payment'}
              {currentStep === 'confirmation' && 'Confirm Payment'}
              {currentStep === 'processing' && 'Processing...'}
              {currentStep === 'success' && 'Payment Sent!'}
              {currentStep === 'error' && 'Payment Failed'}
            </h1>
            <p className="mobile-subtitle text-white/70">
              {currentStep === 'form' && 'Send money instantly worldwide'}
              {currentStep === 'confirmation' && 'Review your transaction details'}
              {currentStep === 'processing' && 'Please wait while we process your payment'}
              {currentStep === 'success' && 'Your payment was sent successfully'}
              {currentStep === 'error' && 'Something went wrong with your payment'}
            </p>
          </div>
        </motion.div>

        {/* Balance Card */}
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
                  {ratesLoading ? '...' : `${fiatBalance.toFixed(2)} EUR`}
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
                      className="btn-mobile-primary h-8 text-sm"
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
              className="space-y-6"
            >
              <Card className="card-mobile">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Send className="w-5 h-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="form-mobile">
                  {/* Recipient */}
                  <div className="input-group">
                    <Label className="label-mobile">
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
                          className="text-white/70 hover:text-white hover:bg-white/10 touch-target"
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => setShowContactPicker(true)}
                          className="btn-mobile-secondary"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button
                          onClick={() => setShowQRScanner(true)}
                          variant="outline"
                          className="border-white/20 bg-transparent hover:bg-white/10 text-white"
                        >
                          📱 Scan QR
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Country */}
                  <div className="input-group">
                    <Label className="label-mobile">Country</Label>
                    <CountrySelector
                      value={formData.country}
                      onSelect={(country) => updateFormField('country', country || '')}
                    />
                  </div>

                  {/* Amount */}
                  <div className="input-group">
                    <Label className="label-mobile">
                      <DollarSign className="w-4 h-4" />
                      Amount (EUR)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => updateFormField('amount', e.target.value)}
                      className="input-mobile"
                    />
                    {formData.amount && currentRate > 0 && (
                      <div className="text-xs text-white/60">
                        ≈ {getXlmAmount()} XLM
                      </div>
                    )}
                  </div>

                  {/* Purpose */}
                  <div className="input-group">
                    <Label className="label-mobile">
                      <MessageSquare className="w-4 h-4" />
                      Purpose
                    </Label>
                    <Input
                      placeholder="What's this payment for?"
                      value={formData.memo}
                      onChange={(e) => updateFormField('memo', e.target.value)}
                      className="input-mobile"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className={isMobile ? "fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent backdrop-blur-sm z-50" : "space-y-3"}>
                <Button
                  onClick={handleSubmit}
                  disabled={!validation.valid || isProcessing}
                  className="btn-mobile-primary w-full min-h-[52px] text-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Payment
                    </>
                  )}
                </Button>

                {!validation.valid && validation.message && (
                  <div className="form-error">
                    <AlertCircle className="w-4 h-4" />
                    {validation.message}
                  </div>
                )}
              </div>
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
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5" />
                    Confirm Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">To:</span>
                      <span className="font-medium text-white">{formData.recipient?.recipient_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Amount:</span>
                      <span className="font-medium text-white">{formData.amount} EUR</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">XLM Amount:</span>
                      <span className="font-medium text-white">{getXlmAmount()} XLM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Purpose:</span>
                      <span className="font-medium text-white">{formData.memo}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-sm">Payment details verified</span>
                  </div>
                </CardContent>
              </Card>

              <div className={isMobile ? "form-submit" : "flex gap-3"}>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('form')}
                  className="btn-mobile-secondary flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={executeTransaction}
                  disabled={isProcessing}
                  className="btn-mobile-primary flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Payment
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="loading-mobile"
            >
              <div className="loading-spinner"></div>
              <p>Processing your payment...</p>
              <p className="text-sm text-white/50">This may take a few seconds</p>
            </motion.div>
          )}

          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <Card className="card-mobile text-center">
                <CardContent className="space-y-4 py-8">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Payment Sent!</h3>
                    <p className="text-white/70">Your payment has been sent successfully</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg text-left">
                    <div className="text-xs text-white/60 mb-1">Transaction ID</div>
                    <div className="font-mono text-sm text-white break-all">{transactionId}</div>
                  </div>
                </CardContent>
              </Card>

              <div className={isMobile ? "form-submit" : "flex gap-3"}>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="btn-mobile-secondary flex-1"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={resetForm}
                  className="btn-mobile-primary flex-1"
                >
                  Send Another
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <Card className="card-mobile text-center">
                <CardContent className="space-y-4 py-8">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Payment Failed</h3>
                    <p className="text-white/70">{errorMessage}</p>
                  </div>
                </CardContent>
              </Card>

              <div className={isMobile ? "form-submit" : "flex gap-3"}>
                <Button
                  onClick={() => setCurrentStep('form')}
                  className="btn-mobile-primary w-full"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Picker Modal */}
        {showContactPicker && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center p-4 pb-safe">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-lg bg-background border border-white/20 rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Select Contact</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowContactPicker(false)}
                    className="text-white/70 hover:text-white touch-target"
                  >
                    Close
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <ContactPicker 
                  onSelectContact={handleContactSelect} 
                  onClose={() => setShowContactPicker(false)}
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* QR Code Scanner */}
        <QRCodeScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
        />

        {/* Biometric Authentication */}
        {showBiometricAuth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <BiometricAuth
              onAuthenticated={handleBiometricSuccess}
              onCancel={() => setShowBiometricAuth(false)}
              title="Verify High-Value Payment"
              subtitle="Please authenticate to proceed with this transaction"
            />
          </div>
        )}
      </div>
    </div>
  );
});