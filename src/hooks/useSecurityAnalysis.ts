
import { useState, useEffect } from "react";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { hapticFeedback } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";

export interface SecurityAnalysisResult {
  status: "processing" | "verified" | "warning" | null;
  threatLevel: "low" | "medium" | "high";
  details: {
    reason?: string;
    recommendedAction?: string;
    confidenceScore?: number;
    isKnownRecipient?: boolean;
    hasUnusualPattern?: boolean;
    isFlaggedCountry?: boolean;
  };
}

export function useSecurityAnalysis(
  amount: string,
  selectedRecipient: FavoriteRecipient | null,
  countryCode: string | undefined
) {
  const [result, setResult] = useState<SecurityAnalysisResult>({
    status: null,
    threatLevel: "low",
    details: {}
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Effect to run security analysis when relevant data changes
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0 || !selectedRecipient || !countryCode) {
      if (result.status !== null) {
        setResult({
          status: null,
          threatLevel: "low",
          details: {}
        });
      }
      return;
    }

    const amountValue = parseFloat(amount);
    setIsAnalyzing(true);
    setResult(prev => ({ ...prev, status: "processing" }));

    // First do client-side quick checks
    let initialThreatLevel = "low";
    const details: SecurityAnalysisResult['details'] = {
      isKnownRecipient: true,
      hasUnusualPattern: false,
      isFlaggedCountry: false,
      confidenceScore: 90
    };

    // Check for high amount
    if (amountValue > 2000) {
      initialThreatLevel = "medium";
      details.hasUnusualPattern = true;
      details.reason = "Large transfer amount";
      details.recommendedAction = "Verify recipient details before proceeding";
      details.confidenceScore = 70;
    }

    // Check for suspicious specific amounts
    if (amountValue === 1337 || amountValue === 666 || amountValue === 911) {
      initialThreatLevel = "medium";
      details.hasUnusualPattern = true;
      details.reason = "Suspicious specific amount pattern";
      details.recommendedAction = "Confirm transaction purpose";
      details.confidenceScore = 65;
    }
    
    // High-risk countries
    const highRiskCountries = ["RU", "IR", "KP", "SY"];
    if (highRiskCountries.includes(countryCode)) {
      initialThreatLevel = "high";
      details.isFlaggedCountry = true;
      details.reason = "Transfer to high-risk jurisdiction";
      details.recommendedAction = "Additional verification required";
      details.confidenceScore = 85;
    }

    // Perform more detailed checks against transaction history
    const analyzeTransaction = async () => {
      try {
        // Check if this recipient has transaction history
        const { data: previousTransactions, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('description', `Payment to ${selectedRecipient.recipient_name}`)
          .limit(5);
          
        if (error) throw error;
        
        if (!previousTransactions || previousTransactions.length === 0) {
          // No history with this recipient
          details.isKnownRecipient = false;
          if (initialThreatLevel === "low") {
            details.reason = "First-time recipient";
            details.recommendedAction = "Verify recipient details";
            details.confidenceScore = 80;
            initialThreatLevel = "medium";
          }
        } else {
          // Check if amount is unusual compared to history
          const avgAmount = previousTransactions.reduce((sum, tx) => sum + tx.amount, 0) / previousTransactions.length;
          
          if (amountValue > avgAmount * 3) {
            details.hasUnusualPattern = true;
            if (initialThreatLevel !== "high") {
              initialThreatLevel = "medium";
              details.reason = "Amount significantly higher than previous transactions";
              details.recommendedAction = "Confirm transaction details";
              details.confidenceScore = 75;
            }
          }
        }
        
        // Set final result with haptic feedback
        setResult({
          status: initialThreatLevel !== "low" ? "warning" : "verified",
          threatLevel: initialThreatLevel as "low" | "medium" | "high",
          details
        });
        
        // Provide haptic feedback based on security analysis result
        hapticFeedback(initialThreatLevel === "low" ? "success" : initialThreatLevel === "medium" ? "warning" : "error");
        
      } catch (error) {
        console.error("Error during security analysis:", error);
        // Fall back to initial assessment on error
        setResult({
          status: initialThreatLevel !== "low" ? "warning" : "verified",
          threatLevel: initialThreatLevel as "low" | "medium" | "high",
          details
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    // Add a delay for better UX (real security checks would take a moment)
    const timer = setTimeout(() => {
      analyzeTransaction();
    }, 1200);
    
    return () => {
      clearTimeout(timer);
    };
  }, [amount, selectedRecipient, countryCode]);

  return {
    securityResult: result,
    isAnalyzing
  };
}
