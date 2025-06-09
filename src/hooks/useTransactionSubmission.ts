import { useState, useEffect, useMemo } from "react";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";
import { useSecurityAnalysis } from "@/hooks/useSecurityAnalysis";
import { UserProfileService } from "@/services/UserProfileService";
import { sendPayment } from "@/lib/stellar/payment";

export interface TransactionFormState {
  amount: string;
  description: string;
  selectedRecipient: FavoriteRecipient | null;
  countryCode: string; // changed from string | undefined to string (always defined)
  selectedPaymentMethod: string;
  verificationCompleted: boolean;
  securityCheck: "processing" | "verified" | "warning" | null;
  threatLevel: "low" | "medium" | "high";
  transferPurpose: string; // always defined
  transferCategory: string; // always defined
}

export function useTransactionSubmission() {
  const { addTransaction, isAdding } = useTransactions();
  const { isSending, balance } = useStellarAccount();
  const [availableFunds, setAvailableFunds] = useState(0);
  const [formState, setFormState] = useState<TransactionFormState>({
    amount: "",
    description: "",
    selectedRecipient: null,
    countryCode: "", // default to empty string
    selectedPaymentMethod: "card",
    verificationCompleted: false,
    securityCheck: null,
    threatLevel: "low",
    transferPurpose: "", // default to empty string
    transferCategory: "" // default to empty string
  });
  
  // New state for transaction flow
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [completedTransactionId, setCompletedTransactionId] = useState("");

  // --- Fiat currency conversion logic ---
  // Default fiat currency (can be "USD" or "EUR")
  const DEFAULT_FIAT = "EUR";
  const [fiatRate, setFiatRate] = useState(0.0); // XLM to EUR
  const [fiatAmount, setFiatAmount] = useState("");

  // Fetch XLM to EUR rate (could be moved to a custom hook)
  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=eur,usd");
        const data = await res.json();
        setFiatRate(data.stellar[DEFAULT_FIAT.toLowerCase()]);
      } catch (e) {
        setFiatRate(0.0);
      }
    }
    fetchRate();
  }, []);

  // Update form state handlers
  const setAmount = (amount: string) => setFormState(prev => ({ ...prev, amount }));
  const setDescription = (description: string) => setFormState(prev => ({ ...prev, description }));
  const setSelectedRecipient = (selectedRecipient: FavoriteRecipient | null) => 
    setFormState(prev => ({ ...prev, selectedRecipient }));
  const setCountryCode = (countryCode: string) => 
    setFormState(prev => ({ ...prev, countryCode }));
  const setSelectedPaymentMethod = (selectedPaymentMethod: string) =>
    setFormState(prev => ({ ...prev, selectedPaymentMethod }));
  const setVerificationCompleted = (verificationCompleted: boolean) =>
    setFormState(prev => ({ ...prev, verificationCompleted }));
  const setTransferPurpose = (transferPurpose: string) =>
    setFormState(prev => ({ ...prev, transferPurpose }));
  const setTransferCategory = (transferCategory: string) =>
    setFormState(prev => ({ ...prev, transferCategory }));

  // When user enters a fiat amount, update XLM amount
  const setFiatAmountAndUpdate = (value: string) => {
    setFiatAmount(value);
    const num = parseFloat(value);
    if (!isNaN(num) && fiatRate > 0) {
      setAmount((num / fiatRate).toFixed(4));
    } else {
      setAmount("");
    }
  };

  // When XLM amount changes, update fiat amount
  useEffect(() => {
    const xlm = parseFloat(formState.amount);
    if (!isNaN(xlm) && fiatRate > 0) {
      setFiatAmount((xlm * fiatRate).toFixed(2));
    } else {
      setFiatAmount("");
    }
  }, [formState.amount, fiatRate]);

  // Use the enhanced security analysis hook
  const { securityResult, isAnalyzing } = useSecurityAnalysis(
    formState.amount,
    formState.selectedRecipient,
    formState.countryCode
  );
  
  // Update security check status based on security analysis result
  useEffect(() => {
    if (securityResult.status !== formState.securityCheck || 
        securityResult.threatLevel !== formState.threatLevel) {
      setFormState(prev => ({
        ...prev,
        securityCheck: securityResult.status,
        threatLevel: securityResult.threatLevel
      }));
    }
  }, [securityResult]);

  // Effect to update available funds from balance
  useEffect(() => {
    if (balance && balance.length > 0) {
      try {
        setAvailableFunds(parseFloat(balance[0].balance));
      } catch (error) {
        console.error("Error parsing balance:", error);
        setAvailableFunds(0);
      }
    } else {
      setAvailableFunds(0);
    }
  }, [balance]);

  // Form validation
  const validateForm = () => {
    const { amount, description, selectedRecipient, countryCode, selectedPaymentMethod } = formState;
    
    if (!selectedRecipient) {
      return { valid: false, reason: "Please select a recipient" };
    }
    
    if (!countryCode) {
      return { valid: false, reason: "Please select a country" };
    }
    
    if (!amount) {
      return { valid: false, reason: "Please enter an amount" };
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return { valid: false, reason: "Amount must be greater than 0" };
    }
    
    if (amountValue > availableFunds) {
      return { valid: false, reason: "Insufficient funds available" };
    }
    
    if (!description) {
      return { valid: false, reason: "Please enter a purpose for this transfer" };
    }
    
    if (!selectedPaymentMethod) {
      return { valid: false, reason: "Please select a payment method" };
    }
    
    // If high threat level and verification not completed, require verification
    if (securityResult.threatLevel === "high" && !formState.verificationCompleted) {
      return { valid: false, reason: "High risk transaction requires verification" };
    }
    
    return { valid: true, reason: "" };
  };
  
  const formValidation = useMemo(() => validateForm(), [formState, availableFunds, securityResult]);
  
  const isFormDisabled = !formValidation.valid || isAnalyzing;
  
  const getDisabledReason = () => {
    if (isAnalyzing) return "Analyzing transaction security...";
    return formValidation.reason;
  };

  // Security verification handler
  const handleSecurityVerify = () => {
    // In a real app, this would show additional verification UI
    toast.info("Additional verification completed");
    hapticFeedback("success");
    setVerificationCompleted(true);
  };
  
  // Handler for users choosing to ignore warnings
  const handleIgnoreWarning = () => {
    toast.info("Proceeding despite security warning");
    hapticFeedback("warning");
    setVerificationCompleted(true);
  };

  // Form submission handling with enhanced feedback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.valid) {
      toast.error(validation.reason);
      hapticFeedback("error");
      return;
    }
    
    // Open confirmation modal instead of immediately processing
    setIsConfirmationOpen(true);
    hapticFeedback("light");
  };
    // Actual transaction execution after confirmation
  const executeTransaction = async () => {
    try {
      const { amount, description, selectedRecipient, selectedPaymentMethod, countryCode, transferPurpose, transferCategory } = formState;
      if (!selectedRecipient) {
        throw new Error("Recipient is required");
      }
      hapticFeedback("medium");
      toast.info("Processing your transaction...");
      
      console.log("Executing transaction to recipient:", selectedRecipient);
      
      // First ensure we can get or create a Stellar account for the recipient
      // by their email/phone/name if they don't already have one
      if (!selectedRecipient.stellar_address.startsWith('G')) {
        try {
          // Try to find recipient by email or phone
          const users = await UserProfileService.findUserByIdentifier(selectedRecipient.recipient_name);
          if (users.length > 0) {
            // Create or get their Stellar account
            const stellarAccount = await UserProfileService.getOrCreateStellarAccount(users[0].id);
            selectedRecipient.stellar_address = stellarAccount.publicKey;
          }
        } catch (err) {
          console.error("Failed to get/create recipient Stellar account:", err);
        }
      }
      
      // Call the direct sendPayment function, passing extra metadata
      const paymentResult = await sendPayment(
        selectedRecipient.stellar_address,
        amount,
        'XLM',
        selectedRecipient.recipient_name,
        selectedRecipient.id,
        description,
        {
          recipient_country: countryCode,
          transfer_purpose: transferPurpose,
          transfer_category: transferCategory
        }
      );
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }
      
      // Use the transaction hash from the payment result
      const transactionId = paymentResult.hash || `tx_${Math.random().toString(36).substring(2, 15)}`;
      
      setCompletedTransactionId(transactionId);
      setIsConfirmationOpen(false);
      setIsSuccessOpen(true);
      setAvailableFunds(prevFunds => {
        const newFunds = prevFunds - parseFloat(amount);
        console.log(`Updated available funds: ${prevFunds} -> ${newFunds}`);
        return newFunds;
      });
      toast.success("Transaction successfully completed!");
      hapticFeedback("success");    } catch (error) {
      console.error("Payment error:", error);      // Ensure any blockchain-specific error messages are replaced with user-friendly messages
      let errorMessage = "Your payment could not be processed. Please try again or contact support.";
      
      if (error instanceof Error) {
        // Replace blockchain-specific error messages with user-friendly versions
        if (error.message.includes("op_no_destination") || error.message.includes("Destination account")) {
          errorMessage = "The recipient could not be found. Please check the payment details and try again.";
        } else if (error.message.includes("underfunded") || error.message.includes("insufficient") || error.message.includes("Insufficient")) {
          errorMessage = "You don't have enough funds available for this payment.";
        } else if (error.message.includes("tx_bad_seq") || error.message.includes("sequence")) {
          errorMessage = "Your payment couldn't be completed. Please try again later.";
        } else if (!error.message.includes("blockchain") && !error.message.includes("Stellar") && !error.message.includes("XLM")) {
          // Use original message only if it doesn't contain blockchain terminology
          errorMessage = "Payment failed: " + error.message;
        }
      }
      
      toast.error(errorMessage);
      hapticFeedback("error");
      setIsConfirmationOpen(false);
    }
  };
  
  // Handle closing confirmation modal
  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false);
    setVerificationCompleted(false);
  };

  // Handle closing success screen
  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    setVerificationCompleted(false);
    
    // Reset form
    setFormState({
      amount: "",
      description: "",
      selectedRecipient: null,
      countryCode: "",
      selectedPaymentMethod: "card",
      verificationCompleted: false,
      securityCheck: null,
      threatLevel: "low",
      transferPurpose: "",
      transferCategory: ""
    });
  };

  const isProcessing = isAdding || isSending || isAnalyzing;

  return {
    formState,
    availableFunds,
    isProcessing,
    isFormDisabled,
    securityResult,
    fiatAmount,
    setFiatAmount: setFiatAmountAndUpdate,
    fiatRate,
    defaultFiat: DEFAULT_FIAT,
    setAmount,
    setDescription,
    setSelectedRecipient,
    setCountryCode,
    setSelectedPaymentMethod,
    setTransferPurpose,
    setTransferCategory,
    handleSubmit,
    getDisabledReason,
    isConfirmationOpen,
    setIsConfirmationOpen,
    executeTransaction,
    isSuccessOpen,
    setIsSuccessOpen,
    completedTransactionId,
    handleSuccessClose,
    handleConfirmationClose, // <-- Expose confirmation close handler
    handleSecurityVerify,
    handleIgnoreWarning
  };
}
