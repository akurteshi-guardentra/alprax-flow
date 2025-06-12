
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import { RecipientSelectionStep } from './wizard-steps/RecipientSelectionStep';
import { AmountSelectionStep } from './wizard-steps/AmountSelectionStep';
import { PurposeReviewStep } from './wizard-steps/PurposeReviewStep';
import { ConfirmationStep } from './wizard-steps/ConfirmationStep';
import TransactionSuccess from './TransactionSuccess';
import { useTransactionSubmission } from '@/hooks/useTransactionSubmission';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { FavoriteRecipient } from '@/types/favoriteRecipient';

interface StepWizardPaymentFlowProps {
  onBack: () => void;
}

export function StepWizardPaymentFlow({ onBack }: StepWizardPaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    recipient: null as FavoriteRecipient | null,
    recipientName: '',
    amount: '',
    purpose: '',
    description: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const { 
    executeTransaction, 
    isProcessing,
    formState,
    setAmount,
    setDescription,
    setSelectedRecipient
  } = useTransactionSubmission();

  const steps = [
    { number: 1, title: 'Recipient', completed: currentStep > 1 },
    { number: 2, title: 'Amount', completed: currentStep > 2 },
    { number: 3, title: 'Purpose', completed: currentStep > 3 },
    { number: 4, title: 'Confirm', completed: false }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleConfirmPayment = async () => {
    if (!formData.recipient) return;

    try {
      // Update the hook's form state with our wizard data
      setSelectedRecipient(formData.recipient);
      setAmount(formData.amount);
      setDescription(formData.description || formData.purpose);

      // Trigger confetti immediately for better UX
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Show success toast
      toast.success(`Payment sent to ${formData.recipientName}!`);

      // Execute the actual transaction (no arguments needed)
      const result = await executeTransaction();

      // Generate a mock transaction ID for demo
      const mockTxId = `TX${Date.now().toString().slice(-8)}`;
      setTransactionId(mockTxId);
      setShowSuccess(true);

    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Reset the wizard
    setCurrentStep(1);
    setFormData({
      recipient: null,
      recipientName: '',
      amount: '',
      purpose: '',
      description: ''
    });
    onBack();
  };

  if (showSuccess && formData.recipient) {
    return (
      <TransactionSuccess
        isOpen={true}
        onClose={handleSuccessClose}
        recipient={formData.recipient}
        amount={formData.amount}
        transactionId={transactionId}
        defaultFiat="EUR"
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Send Money</h1>
      </div>

      {/* Progress Indicator */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.number 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/20 text-white/60'
                }`}>
                  {step.completed ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-white' : 'text-white/60'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-0.5 w-8 ${
                    step.completed ? 'bg-green-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <RecipientSelectionStep
              selectedRecipient={formData.recipient}
              onSelectRecipient={(recipient) => {
                setFormData({ 
                  ...formData, 
                  recipient: recipient, 
                  recipientName: recipient.recipient_name 
                });
                handleNext();
              }}
            />
          )}

          {currentStep === 2 && (
            <AmountSelectionStep
              amount={formData.amount}
              onAmountChange={(amount) => setFormData({ ...formData, amount })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <PurposeReviewStep
              description={formData.description}
              setDescription={(description) => setFormData({ ...formData, description })}
              selectedRecipient={formData.recipient}
              amount={formData.amount}
              defaultFiat="EUR"
            />
          )}

          {currentStep === 4 && (
            <ConfirmationStep
              selectedRecipient={formData.recipient}
              amount={formData.amount}
              description={formData.description}
              defaultFiat="EUR"
              isProcessing={isProcessing}
              onConfirm={handleConfirmPayment}
            />
          )}

          {/* Navigation Buttons */}
          {currentStep !== 1 && currentStep !== 4 && (
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button
                onClick={currentStep === 3 ? handleNext : handleNext}
                disabled={
                  (currentStep === 2 && !formData.amount) ||
                  (currentStep === 3 && !formData.description)
                }
                className="flex-1 bg-white text-blue-900 hover:bg-white/90"
              >
                Continue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
