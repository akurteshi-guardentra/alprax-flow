
import { useState, useEffect } from "react";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { hapticFeedback } from "@/lib/haptics";

export interface SecurityCheckState {
  securityCheck: "processing" | "verified" | "warning" | null;
  threatLevel: "low" | "medium" | "high";
}

export function useSecurityCheck(
  amount: string,
  selectedRecipient: FavoriteRecipient | null,
  countryCode: string | undefined
) {
  const [securityState, setSecurityState] = useState<SecurityCheckState>({
    securityCheck: null,
    threatLevel: "low"
  });
  
  // For debugging
  const [prevValues, setPrevValues] = useState({
    amount: "",
    recipientId: "",
    country: ""
  });

  // Effect to run security check when relevant data changes
  useEffect(() => {
    console.log("Security check running with:", { 
      amount, 
      recipient: selectedRecipient?.recipient_name, 
      countryCode 
    });
    
    const currentValues = {
      amount: amount,
      recipientId: selectedRecipient?.id || "",
      country: countryCode || ""
    };
    
    // Track changing values for debugging
    const changed = Object.entries(currentValues).filter(
      ([key, value]) => value !== prevValues[key as keyof typeof prevValues]
    );
    
    if (changed.length > 0) {
      console.log("Changed values:", changed.map(([k, v]) => `${k}: ${v}`));
      setPrevValues(currentValues);
    }
    
    if (amount && parseFloat(amount) > 0 && selectedRecipient) {
      setSecurityState(prev => ({ ...prev, securityCheck: "processing" }));
      console.log("Security check processing started");
      
      // Simulate AI processing delay
      const timer = setTimeout(() => {
        // Enhanced risk assessment logic
        const amountValue = parseFloat(amount);
        let riskLevel: "low" | "medium" | "high" = "low";
        
        console.log("Analyzing transaction risk...");
        
        // Check for suspicious amount patterns
        if (amountValue > 2000) {
          riskLevel = "medium";
          console.log("Risk: Large amount transfer detected");
        } else if (amountValue === 1337 || amountValue === 666 || amountValue === 911) {
          // Suspicious specific amounts
          riskLevel = "medium";
          console.log("Risk: Suspicious specific amount detected");
        }
        
        // Check for suspicious recipient patterns
        if (selectedRecipient.recipient_name.toLowerCase().includes("test") ||
            selectedRecipient.stellar_address.toLowerCase().includes("test")) {
          riskLevel = "medium";
          console.log("Risk: Test recipient detected");
        }
        
        // Check for high-risk countries
        if (countryCode === "RU" || countryCode === "IR" || countryCode === "KP") {
          riskLevel = "high";
          console.log("Risk: High-risk country detected");
        }
        
        // Set the result with haptic feedback
        console.log(`Setting security check result: ${riskLevel !== "low" ? "warning" : "verified"}, threat level: ${riskLevel}`);
        setSecurityState({ 
          threatLevel: riskLevel,
          securityCheck: riskLevel !== "low" ? "warning" : "verified" 
        });
        
        // Provide haptic feedback based on security check result
        hapticFeedback(riskLevel === "low" ? "success" : riskLevel === "medium" ? "warning" : "error");
        
      }, 1200);
      
      return () => {
        console.log("Cleaning up security check timer");
        clearTimeout(timer);
      };
    } else {
      if (securityState.securityCheck !== null) {
        console.log("Security check reset - missing required data");
        setSecurityState({ securityCheck: null, threatLevel: "low" });
      }
    }
  }, [amount, selectedRecipient, countryCode]);

  return securityState;
}
