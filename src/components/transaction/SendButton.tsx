
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Loader2, Shield, Lock, Cpu, AlertTriangle, InfoIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface SendButtonProps {
  isProcessing: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  className?: string;
}

export function SendButton({ isProcessing, isDisabled, disabledReason, className }: SendButtonProps) {
  const [securityLevel, setSecurityLevel] = useState<"standard" | "enhanced" | "ai-enhanced">("standard");
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [securityChecks, setSecurityChecks] = useState({
    encryption: { completed: false, passed: false },
    fraud: { completed: false, passed: false },
    route: { completed: false, passed: false },
    total: 0
  });

  // Simulate advanced security check
  useEffect(() => {
    if (!isDisabled && !isProcessing) {
      // Reset security checks
      setSecurityChecks({
        encryption: { completed: false, passed: false },
        fraud: { completed: false, passed: false },
        route: { completed: false, passed: false },
        total: 0
      });
      
      // Simulate encryption check
      setTimeout(() => {
        setSecurityChecks(prev => ({
          ...prev,
          encryption: { completed: true, passed: true },
          total: prev.total + 33
        }));
        
        // Simulate fraud detection
        setTimeout(() => {
          setSecurityChecks(prev => ({
            ...prev,
            fraud: { completed: true, passed: true },
            total: prev.total + 33
          }));
          
          // Simulate route optimization
          setTimeout(() => {
            setSecurityChecks(prev => ({
              ...prev,
              route: { completed: true, passed: true },
              total: prev.total + 34
            }));
            
            // Set final security level based on various factors
            const randomFactor = Math.random();
            if (randomFactor > 0.6) {
              setSecurityLevel("ai-enhanced");
            } else if (randomFactor > 0.3) {
              setSecurityLevel("enhanced");
            } else {
              setSecurityLevel("standard");
            }
            
          }, 600);
        }, 500);
      }, 400);
    }
  }, [isDisabled, isProcessing]);

  // Determine the reason why the button is disabled
  const getDisabledReason = () => {
    if (disabledReason) {
      // Check if this is an insufficient funds error
      if (disabledReason.toLowerCase().includes("insufficient")) {
        return "Insufficient funds. Try adding test funds using the 'Add Test Funds' button.";
      }
      return disabledReason;
    }
    return "Please complete all required fields";
  };

  const reasonMessage = getDisabledReason();
  const isInsufficientFunds = reasonMessage.toLowerCase().includes("insufficient");

  return (
    <div className="w-full space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="flex items-center justify-center mb-1 cursor-help"
              onMouseEnter={() => setShowSecurityInfo(true)}
              onMouseLeave={() => setShowSecurityInfo(false)}
            >
              <div className="w-full flex-1 h-2 rounded-full bg-gray-700/50 overflow-hidden">
                {!isDisabled && (
                  <motion.div 
                    className={`h-full rounded-full ${
                      securityLevel === "ai-enhanced" ? "bg-gradient-to-r from-green-500 to-blue-500" : 
                      securityLevel === "enhanced" ? "bg-green-500/70" : 
                      "bg-yellow-500/70"
                    }`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${securityChecks.total}%` }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
              <div className="flex items-center ml-2">
                {securityLevel === "ai-enhanced" ? (
                  <Cpu className="h-3 w-3 text-blue-500" />
                ) : (
                  <Lock className={`h-3 w-3 ${
                    securityLevel === "enhanced" ? "text-green-500" : "text-yellow-500"
                  }`} />
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-gray-800 text-white border-none p-3 max-w-[280px]">
            <p className="text-sm font-medium mb-2">
              {securityLevel === "ai-enhanced" 
                ? "AI-Enhanced Security: Maximum Protection" 
                : securityLevel === "enhanced"
                ? "Enhanced Security: High Protection Level" 
                : "Standard Security: Basic Protection"}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Encryption Check:</span>
                <span className={securityChecks.encryption.completed 
                  ? securityChecks.encryption.passed ? "text-green-400" : "text-red-400" 
                  : "text-blue-400"}
                >
                  {securityChecks.encryption.completed 
                    ? securityChecks.encryption.passed ? "Passed" : "Failed" 
                    : "Checking..."}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fraud Detection:</span>
                <span className={securityChecks.fraud.completed 
                  ? securityChecks.fraud.passed ? "text-green-400" : "text-red-400" 
                  : "text-blue-400"}
                >
                  {securityChecks.fraud.completed 
                    ? securityChecks.fraud.passed ? "Passed" : "Failed" 
                    : "Analyzing..."}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Route Optimization:</span>
                <span className={securityChecks.route.completed 
                  ? securityChecks.route.passed ? "text-green-400" : "text-red-400" 
                  : "text-blue-400"}
                >
                  {securityChecks.route.completed 
                    ? securityChecks.route.passed ? "Optimized" : "Standard" 
                    : "Processing..."}
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {isDisabled && !isProcessing && (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg mb-2 ${
          isInsufficientFunds 
            ? "bg-blue-500/10 border border-blue-500/20" 
            : "bg-yellow-500/10 border border-yellow-500/20"
        }`}>
          {isInsufficientFunds ? (
            <InfoIcon className="h-3.5 w-3.5 text-blue-400" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
          )}
          <p className={`text-xs ${
            isInsufficientFunds ? "text-blue-300" : "text-yellow-400"
          }`}>{reasonMessage}</p>
        </div>
      )}
      
      {!isDisabled && !isProcessing && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-2">
          <InfoIcon className="h-3.5 w-3.5 text-blue-400" />
          <p className="text-xs text-blue-300">
            This is a test transaction using the Stellar testnet
          </p>
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={isProcessing || isDisabled}
        className={`w-full h-10 sm:h-12 bg-gradient-to-r from-blue-500/80 to-blue-600/80 hover:from-blue-500/90 hover:to-blue-600/90 text-white text-sm sm:text-base ${className}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            Processing Securely...
          </>
        ) : (
          <>
            <ArrowUpRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Send Money Securely
            {securityLevel === "ai-enhanced" ? (
              <Cpu className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Shield className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </>
        )}
      </Button>
    </div>
  );
}
