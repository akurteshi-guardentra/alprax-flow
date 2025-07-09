import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActionSelectionStep } from "./ActionSelectionStep";
import { RecipientSelectionStep } from "./RecipientSelectionStep";
import { AmountSelectionStep } from "./AmountSelectionStep";
import { PaymentMethodStep } from "./PaymentMethodStep";
import { ProcessingStep } from "./ProcessingStep";
import { SuccessStep } from "./SuccessStep";

interface PaymentWizardProps {
  onComplete: () => void;
  className?: string;
}

const steps = [
  { id: 'action', title: 'Action', component: ActionSelectionStep },
  { id: 'recipient', title: 'Recipient', component: RecipientSelectionStep },
  { id: 'amount', title: 'Amount', component: AmountSelectionStep },
  { id: 'method', title: 'Method', component: PaymentMethodStep },
  { id: 'processing', title: 'Processing', component: ProcessingStep },
  { id: 'success', title: 'Complete', component: SuccessStep },
];

export const PaymentWizard = memo(function PaymentWizard({ 
  onComplete, 
  className 
}: PaymentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = (stepData?: any) => {
    if (stepData) {
      setWizardData(prev => ({ ...prev, ...stepData }));
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className={cn("flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800", className)}>
      {/* Progress Header */}
      <div className="px-4 py-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Send Payment</h2>
          <div className="text-sm text-white/60">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(index)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  index < currentStep 
                    ? "bg-green-500 text-white" 
                    : index === currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-white/20 text-white/60"
                )}
                disabled={index > currentStep}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </button>
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "w-8 h-0.5 mx-1 transition-colors",
                    index < currentStep ? "bg-green-500" : "bg-white/20"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Step Title */}
        <div className="mt-4">
          <h3 className="text-lg font-medium text-white">{steps[currentStep].title}</h3>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {currentStep === 0 && (
              <ActionSelectionStep
                data={wizardData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 1 && (
              <RecipientSelectionStep
                data={wizardData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 2 && (
              <AmountSelectionStep
                data={wizardData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <PaymentMethodStep
                data={wizardData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <ProcessingStep
                data={wizardData}
                onNext={handleNext}
                onBack={handleBack}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            )}
            {currentStep === 5 && (
              <SuccessStep
                data={wizardData}
                onComplete={onComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      {currentStep < steps.length - 2 && (
        <div className="px-4 py-4 border-t border-white/10 bg-slate-800/50">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => handleNext()}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});