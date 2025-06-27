
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
  countryCode: string;
  selectedPaymentMethod: string;
  verificationCompleted: boolean;
  securityCheck: "processing" | "verified" | "warning" | null;
  threatLevel: "low" | "medium" | "high";
  transferPurpose: string;
  transferCategory: string;
}

export function useTransactionSubmission() {
  const { addTransaction, isAdding } = useTransactions();
  const { isSending, balance, refreshBalance } = useStellarAccount();
  const [availableFunds, setAvailableFunds] = useState(0);
  const [formState, setFormState] = useState<TransactionFormState>({
    amount: "",
    description: "",
    selectedRecipient: null,
    countryCode: "",
    selectedPaymentMethod: "stellar",
    verificationCompleted: false,
    securityCheck: null,
    threatLevel: "low",
    transferPurpose: "",
    transferCategory: ""
  });
  
  // Transaction flow state
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [completedTransactionId, setCompletedTransactionId] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Fiat currency conversion logic
  const DEFAULT_FIAT = "EUR";
  const [fiatRate, setFiatRate] = useState(0.0);
  const [fiatAmount, setFiatAmount] = useState("");

  // Fetch XLM to EUR rate
  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=eur,usd");
        const data = await res.json();
        setFiatRate(data.stellar[DEFAULT_FIAT.toLowerCase()]);
      } catch (e) {
        console.error("Failed to fetch fiat rate:", e);
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

  // Fiat amount handling with proper conversion
  const setFiatAmountAndUpdate = (value: string) => {
    setFiatAmount(value);
    const fiatNum = parseFloat(value);
    if (!isNaN(fiatNum) && fiatRate > 0) {
      // Convert fiat to XLM for the actual transaction
      const xlmAmount = (fiatNum / fiatRate).toFixed(7);
      setAmount(xlmAmount);
      console.log(`Converting ${fiatNum} ${DEFAULT_FIAT} to ${xlmAmount} XLM at rate ${fiatRate}`);
    } else {
      setAmount("");
    }
  };

  // Update fiat amount when XLM amount changes (but avoid loops)
  useEffect(() => {
    const xlm = parseFloat(formState.amount);
    if (!isNaN(xlm) && fiatRate > 0) {
      const fiatValue = (xlm * fiatRate).toFixed(2);
      // Only update if it's significantly different to avoid loops
      if (Math.abs(parseFloat(fiatAmount) - parseFloat(fiatValue)) > 0.01) {
        setFiatAmount(fiatValue);
      }
    } else if (formState.amount === "") {
      setFiatAmount("");
    }
  }, [formState.amount, fiatRate]);

  // Use security analysis hook
  const { securityResult, isAnalyzing } = useSecurityAnalysis(
    formState.amount,
    formState.selectedRecipient,
    formState.countryCode
  );
  
  // Update security check status
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

  // Update available funds from balance
  useEffect(() => {
    if (balance && balance.length > 0) {
      try {
        const xlmBalance = parseFloat(balance[0].balance);
        setAvailableFunds(xlmBalance);
      } catch (error) {
        console.error("Error parsing balance:", error);
        setAvailableFunds(0);
      }
    } else {
      setAvailableFunds(0);
    }
  }, [balance]);

  // Enhanced form validation
  const validateForm = () => {
    const { amount, description, selectedRecipient, countryCode, selectedPaymentMethod } = formState;
    
    if (!selectedRecipient) {
      return { valid: false, reason: "Please select a recipient" };
    }
    
    if (!selectedRecipient.stellar_address || selectedRecipient.stellar_address.trim() === "") {
      return { valid: false, reason: "Invalid recipient address" };
    }
    
    if (!amount || amount.trim() === "") {
      return { valid: false, reason: "Please enter an amount" };
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return { valid: false, reason: "Amount must be greater than 0" };
    }
    
    if (amountValue > availableFunds) {
      return { valid: false, reason: `Insufficient funds. Available: ${availableFunds.toFixed(4)} XLM` };
    }
    
    if (!description || description.trim() === "") {
      return { valid: false, reason: "Please enter a purpose for this transfer" };
    }
    
    if (securityResult.threatLevel === "high" && !formState.verificationCompleted) {
      return { valid: false, reason: "High risk transaction requires verification" };
    }
    
    return { valid: true, reason: "" };
  };
  
  const formValidation = useMemo(() => validateForm(), [formState, availableFunds, securityResult]);
  
  const isFormDisabled = !formValidation.valid || isAnalyzing || isExecuting;
  
  const getDisabledReason = () => {
    if (isExecuting) return "Processing payment...";
    if (isAnalyzing) return "Analyzing transaction security...";
    return formValidation.reason;
  };

  // Security verification handlers
  const handleSecurityVerify = () => {
    toast.info("Additional verification completed");
    hapticFeedback("success");
    setVerificationCompleted(true);
  };
  
  const handleIgnoreWarning = () => {
    toast.info("Proceeding despite security warning");
    hapticFeedback("warning");
    setVerificationCompleted(true);
  };

  // Form submission handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.valid) {
      toast.error(validation.reason);
      hapticFeedback("error");
      return;
    }
    
    setIsConfirmationOpen(true);
    hapticFeedback("light");
  };

  // Enhanced transaction execution with retry mechanism
  const executeTransaction = async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    try {
      setIsExecuting(true);
      const { amount, description, selectedRecipient, countryCode, transferPurpose, transferCategory } = formState;
      
      if (!selectedRecipient) {
        throw new Error("Recipient is required");
      }

      console.log("Executing transaction:", {
        recipient: selectedRecipient.stellar_address,
        xlmAmount: amount, // This is now the XLM amount
        fiatAmount: fiatAmount,
        description
      });

      hapticFeedback("medium");
      toast.loading("Processing your payment...", { id: "payment-processing" });
      
      // Validate Stellar address format
      if (!selectedRecipient.stellar_address.startsWith('G') || selectedRecipient.stellar_address.length !== 56) {
        throw new Error("Invalid recipient Stellar address format");
      }
      
      // Use the XLM amount (formState.amount) for the actual payment
      const paymentResult = await sendPayment(
        selectedRecipient.stellar_address,
        amount, // This is the XLM amount
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
      
      // Success handling
      const transactionId = paymentResult.txHash || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      toast.dismiss("payment-processing");
      toast.success("Payment sent successfully!");
      hapticFeedback("success");
      
      setCompletedTransactionId(transactionId);
      setIsConfirmationOpen(false);
      setIsSuccessOpen(true);
      
      // Update available funds and refresh balance
      setAvailableFunds(prev => Math.max(0, prev - parseFloat(amount)));
      
      // Refresh balance from network
      setTimeout(() => {
        refreshBalance();
      }, 1000);
      
    } catch (error: any) {
      console.error("Payment execution error:", error);
      
      // Retry logic for network-related errors
      if (retryCount < MAX_RETRIES && 
          (error.message?.includes('network') || 
           error.message?.includes('timeout') || 
           error.message?.includes('tx_bad_seq'))) {
        
        console.log(`Retrying payment (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        toast.dismiss("payment-processing");
        toast.loading(`Retrying payment (${retryCount + 1}/${MAX_RETRIES})...`, { id: "payment-retry" });
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return executeTransaction(retryCount + 1);
      }
      
      // Enhanced error handling
      let errorMessage = "Your payment could not be processed. Please try again or contact support.";
      
      if (error.message) {
        if (error.message.includes("underfunded") || error.message.includes("insufficient")) {
          errorMessage = "You don't have enough funds available for this payment.";
        } else if (error.message.includes("no_destination") || error.message.includes("not found")) {
          errorMessage = "The recipient address couldn't be found. Please check the address and try again.";
        } else if (error.message.includes("Invalid recipient")) {
          errorMessage = "The recipient address format is invalid. Please check and try again.";
        } else if (error.message.includes("network") || error.message.includes("timeout")) {
          errorMessage = "Network error occurred. Please check your connection and try again.";
        } else if (!error.message.includes("Stellar") && !error.message.includes("blockchain")) {
          errorMessage = error.message;
        }
      }
      
      toast.dismiss("payment-processing");
      toast.dismiss("payment-retry");
      toast.error(errorMessage);
      hapticFeedback("error");
      setIsConfirmationOpen(false);
      
    } finally {
      setIsExecuting(false);
    }
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
      selectedPaymentMethod: "stellar",
      verificationCompleted: false,
      securityCheck: null,
      threatLevel: "low",
      transferPurpose: "",
      transferCategory: ""
    });
    
    setFiatAmount("");
  };

  const isProcessing = isAdding || isSending || isAnalyzing || isExecuting;

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
    handleSecurityVerify,
    handleIgnoreWarning,
    isExecuting
  };
}
