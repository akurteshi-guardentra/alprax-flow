import { useState } from "react";
import { useTransactionSubmission } from "@/hooks/useTransactionSubmission";
import { useEnhancedPayment } from "@/hooks/useEnhancedPayment";
import { FormContainer } from "./transaction/FormContainer";
import { QRCodeTab } from "./transaction/QRCodeTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBottomSheet, BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { hapticFeedback } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { CreditCard, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodePayment } from "./payment/QRCodePayment";
import { TransactionConfirmation } from "./transaction/TransactionConfirmation";
import TransactionSuccess from "./transaction/TransactionSuccess";
import { PaymentStatusPanel } from "./PaymentStatusPanel";

export function TransactionForm() {
  const {
    formState,
    availableFunds,
    isProcessing,
    isFormDisabled,
    setDescription,
    setSelectedRecipient,
    setCountryCode,
    setSelectedPaymentMethod,
    handleSubmit,
    getDisabledReason,
    isConfirmationOpen,
    setIsConfirmationOpen,
    executeTransaction,
    isSuccessOpen,
    completedTransactionId,
    handleSuccessClose,
    fiatAmount,
    setFiatAmount,
    defaultFiat,
    fiatRate
  } = useTransactionSubmission();
  
  // Enhanced payment hook for better error handling and features
  const enhancedPayment = useEnhancedPayment();
  
  const isMobile = useIsMobile();
  const qrCodeSheet = useBottomSheet();
  const [activeTab, setActiveTab] = useState<"form" | "qr">("form");

  const { 
    amount, 
    description, 
    selectedRecipient, 
    countryCode, 
    securityCheck, 
    threatLevel,
    selectedPaymentMethod
  } = formState;

  // Generate dummy payment URL for QR code
  const generatePaymentUrl = () => {
    const baseUrl = "https://pay.alprax.app/";
    const params = new URLSearchParams();
    if (selectedRecipient) {
      params.append("to", selectedRecipient.stellar_address);
      params.append("name", selectedRecipient.recipient_name);
    }
    if (fiatAmount) { // Use fiatAmount for QR code
      params.append("amount", fiatAmount);
      params.append("currency", defaultFiat); // Add currency to QR
    }
    if (description) {
      params.append("desc", description);
    }
    return `${baseUrl}?${params.toString()}`;
  };

  // Handle QR code toggle
  const toggleQRCode = () => {
    if (isMobile) {
      if (!qrCodeSheet.isOpen) {
        hapticFeedback("medium");
        qrCodeSheet.open();
      } else {
        qrCodeSheet.close();
      }
    } else {
      setActiveTab(activeTab === "form" ? "qr" : "form");
      hapticFeedback("light");
    }
  };

  const handleTabChange = (tab: "form" | "qr") => {
    setActiveTab(tab);
    hapticFeedback("light");
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Payment Status Panel - Shows pending, failed, and error status */}
      <PaymentStatusPanel />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden"
      >
      {!isMobile && (
        <div className="flex justify-center mb-4">
          <div className="inline-flex bg-slate-800/60 p-1 rounded-lg">
            <Button
              type="button"
              onClick={() => handleTabChange("form")}
              variant="ghost"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                activeTab === "form"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Send Money
            </Button>
            <Button
              type="button"
              onClick={() => handleTabChange("qr")}
              variant="ghost"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                activeTab === "qr"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <QrCode className="mr-2 h-4 w-4" />
              QR Payment
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {(activeTab === "form" || isMobile) && (
          <FormContainer
            selectedRecipient={selectedRecipient}
            setSelectedRecipient={setSelectedRecipient}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            amount={fiatAmount} // Pass fiatAmount to FormContainer
            setAmount={setFiatAmount} // Pass setFiatAmount to FormContainer
            availableFunds={availableFunds} // This is XLM, convert to fiat for display in AmountField
            description={description}
            setDescription={setDescription}
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            securityCheck={securityCheck}
            threatLevel={threatLevel}
            isProcessing={isProcessing}
            isFormDisabled={isFormDisabled}
            handleSubmit={handleSubmit}
            isMobile={isMobile}
            toggleQRCode={toggleQRCode}
            getDisabledReason={getDisabledReason}
            defaultFiat={defaultFiat} // Pass defaultFiat
            fiatRate={fiatRate} // Pass fiatRate for available funds conversion
          />
        )}

        {(activeTab === "qr" && !isMobile) && (
          <QRCodeTab
            paymentUrl={generatePaymentUrl()}
            amount={fiatAmount ? `${fiatAmount} ${defaultFiat}` : undefined} // Show fiat amount in QR tab
            recipientName={selectedRecipient?.recipient_name}
          />
        )}
      </AnimatePresence>

      {/* Transaction Confirmation Dialog */}
      {selectedRecipient && (
        <TransactionConfirmation
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={executeTransaction}
          recipient={selectedRecipient}
          amount={fiatAmount} // Show fiatAmount in confirmation
          description={description}
          paymentMethod={selectedPaymentMethod}
          securityCheck={securityCheck === "verified" ? "verified" : "warning"}
          threatLevel={threatLevel}
          defaultFiat={defaultFiat} // Pass defaultFiat
        />
      )}
      
      {/* Transaction Success Dialog */}
      {selectedRecipient && (
        <TransactionSuccess
          isOpen={isSuccessOpen}
          onClose={handleSuccessClose}
          recipient={selectedRecipient}
          amount={fiatAmount} // Show fiatAmount in success screen
          transactionId={completedTransactionId}
          defaultFiat={defaultFiat} // Pass defaultFiat
        />
      )}

      {/* QR Code Bottom Sheet for Mobile */}
      {isMobile && (
        <BottomSheet
          isOpen={qrCodeSheet.isOpen}
          onClose={qrCodeSheet.close}
          snapPoints={[90]}
          title="Scan QR Code to Pay"
        >
          <QRCodePayment
            paymentUrl={generatePaymentUrl()}
            amount={fiatAmount ? `${fiatAmount} ${defaultFiat}` : undefined} // Show fiat amount in QR sheet
            recipientName={selectedRecipient?.recipient_name}
            onRefresh={() => console.log("Refreshing QR code")}
            className="p-0"
          />
        </BottomSheet>
      )}
      </motion.div>
    </div>
  );
}
