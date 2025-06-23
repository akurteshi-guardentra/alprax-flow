
import { Shield, Lock, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RecipientField } from "./RecipientField";
import { CountrySelector } from "@/components/CountrySelector";
import { AmountField } from "./AmountField";
import { PurposeField } from "./PurposeField";
import { SecurityStatusIndicator } from "./SecurityStatusIndicator";
import { SecurityWarning } from "./SecurityWarning";
import { PaymentMethodSelector } from "../payment/PaymentMethodSelector";
import { SendButton } from "./SendButton";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { hapticFeedback } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface FormContainerProps {
  selectedRecipient: FavoriteRecipient | null;
  setSelectedRecipient: (recipient: FavoriteRecipient | null) => void;
  countryCode?: string;
  setCountryCode: (country: string | undefined) => void;
  amount: string; // This will now be fiatAmount
  setAmount: (amount: string) => void; // This will now be setFiatAmount
  availableFunds: number; // This is XLM balance
  description: string;
  setDescription: (description: string) => void;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  securityCheck: "processing" | "verified" | "warning" | null;
  threatLevel: "low" | "medium" | "high";
  isProcessing: boolean;
  isFormDisabled: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  isMobile: boolean;
  toggleQRCode: () => void;
  getDisabledReason: () => string;
  defaultFiat: string; // Added defaultFiat
  fiatRate: number; // Added fiatRate
}

export function FormContainer({
  selectedRecipient,
  setSelectedRecipient,
  countryCode,
  setCountryCode,
  amount, // fiatAmount
  setAmount, // setFiatAmount
  availableFunds, // XLM balance
  description,
  setDescription,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  securityCheck,
  threatLevel,
  isProcessing,
  isFormDisabled,
  handleSubmit,
  isMobile,
  toggleQRCode,
  getDisabledReason,
  defaultFiat, // Added
  fiatRate // Added
}: FormContainerProps) {
  // Convert available XLM funds to fiat for display in AmountField
  const availableFiatFunds = availableFunds * fiatRate;

  const handlePaymentComplete = () => {
    // This is a no-op for the transaction form since we're not actually processing payments here
    console.log('Payment completed in transaction form');
  };

  return (
    <motion.form 
      key="form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={handleSubmit} 
      className={cn(
        "space-y-4 sm:space-y-6 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm rounded-xl border border-slate-700/50",
        isMobile ? "p-4" : "p-6"
      )}
    >
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg sm:text-xl font-semibold text-white">Send Money</h3>
        </div>
        <SecurityStatusIndicator securityCheck={securityCheck} threatLevel={threatLevel} />
      </div>
      
      <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-600/10 border border-blue-600/20 mb-4">
        <Lock className="h-4 w-4 text-blue-400" />
        <p className="text-xs text-blue-300">AI-powered security monitoring active</p>
      </div>
      
      <div className="space-y-4">
        <RecipientField 
          selectedRecipient={selectedRecipient}
          setSelectedRecipient={setSelectedRecipient}
          setCountryCode={setCountryCode}
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-white">Country</label>
            <span className="text-xs text-white/50">Required</span>
          </div>
          <CountrySelector
            value={countryCode}
            onSelect={setCountryCode}
          />
        </div>

        <AmountField 
          amount={amount} // Pass fiatAmount (already named 'amount' in this scope)
          setAmount={setAmount} // Pass setFiatAmount (already named 'setAmount' in this scope)
          availableFunds={availableFiatFunds} // Pass availableFiatFunds
          defaultFiat={defaultFiat} // Pass defaultFiat to AmountField
        />

        <PurposeField 
          description={description} 
          setDescription={setDescription}
        />

        <div>
          <PaymentMethodSelector 
            onSelect={(methodId) => setSelectedPaymentMethod(methodId)}
            selected={selectedPaymentMethod}
            amount={parseFloat(amount) * 100 || 0} // Convert to cents, default to 0
            onPaymentComplete={handlePaymentComplete}
          />
          
          {isMobile && (
            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={toggleQRCode}
                className="bg-slate-700/50 text-white border-slate-600 hover:bg-slate-600"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Use QR Code
              </Button>
            </div>
          )}
        </div>

        {securityCheck === "warning" && (
          <SecurityWarning threatLevel={threatLevel} />
        )}

        {isMobile ? (
          <div className="fixed bottom-20 left-4 right-4 z-40">
            <SendButton 
              isProcessing={isProcessing} 
              isDisabled={isFormDisabled}
              disabledReason={getDisabledReason()}
            />
          </div>
        ) : (
          <SendButton 
            isProcessing={isProcessing} 
            isDisabled={isFormDisabled}
            disabledReason={getDisabledReason()}
          />
        )}
      </div>
    </motion.form>
  );
}
