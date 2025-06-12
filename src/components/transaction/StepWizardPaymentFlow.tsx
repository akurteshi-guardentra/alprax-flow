
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { useTransactionSubmission } from "@/hooks/useTransactionSubmission";
import { cn } from "@/lib/utils";
import { RecipientSelectionStep } from "./wizard-steps/RecipientSelectionStep";
import { AmountSelectionStep } from "./wizard-steps/AmountSelectionStep";
import { PurposeReviewStep } from "./wizard-steps/PurposeReviewStep";
import { ConfirmationStep } from "./wizard-steps/ConfirmationStep";

interface StepWizardPaymentFlowProps {
  onBack: () => void;
}

const steps = [
  { id: 'recipient', title: 'Select Recipient', description: 'Who are you sending money to?' },
  { id: 'amount', title: 'Enter Amount', description: 'How much would you like to send?' },
  { id: 'purpose', title: 'Purpose & Review', description: 'What is this payment for?' },
  { id: 'confirm', title: 'Confirm', description: 'Review and confirm your payment' }
];

export function StepWizardPaymentFlow({ onBack }: StepWizardPaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const {
    formState,
    availableFunds,
    isProcessing,
    fiatAmount,
    setFiatAmount,
    defaultFiat,
    fiatRate,
    setSelectedRecipient,
    setDescription,
    executeTransaction,
    isConfirmationOpen,
    setIsConfirmationOpen,
    isSuccessOpen,
    handleSuccessClose,
    completedTransactionId
  } = useTransactionSubmission();

  const { selectedRecipient, description } = formState;

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: return selectedRecipient !== null;
      case 1: return fiatAmount && parseFloat(fiatAmount) > 0;
      case 2: return description.trim().length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1) {
      // Final step - execute transaction
      setIsConfirmationOpen(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                index < currentStep ? "bg-blue-500 text-white" :
                index === currentStep ? "bg-blue-500/20 text-blue-400 border-2 border-blue-500" :
                "bg-white/10 text-white/50"
              )}>
                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 mx-2 transition-colors",
                  index < currentStep ? "bg-blue-500" : "bg-white/20"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white">{steps[currentStep].title}</h2>
          <p className="text-sm text-white/70">{steps[currentStep].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && (
              <RecipientSelectionStep
                selectedRecipient={selectedRecipient}
                onSelectRecipient={setSelectedRecipient}
              />
            )}
            {currentStep === 1 && (
              <AmountSelectionStep
                amount={fiatAmount}
                setAmount={setFiatAmount}
                availableFunds={availableFunds}
                defaultFiat={defaultFiat}
                fiatRate={fiatRate}
              />
            )}
            {currentStep === 2 && (
              <PurposeReviewStep
                description={description}
                setDescription={setDescription}
                selectedRecipient={selectedRecipient}
                amount={fiatAmount}
                defaultFiat={defaultFiat}
              />
            )}
            {currentStep === 3 && (
              <ConfirmationStep
                selectedRecipient={selectedRecipient}
                amount={fiatAmount}
                description={description}
                defaultFiat={defaultFiat}
                isProcessing={isProcessing}
                onConfirm={() => setIsConfirmationOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="border-white/20 bg-transparent hover:bg-white/10 text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Back' : 'Previous'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceedToNext() || isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {currentStep === steps.length - 1 ? 'Send Payment' : 'Next'}
          {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
