
import { AlertTriangle, Info, ShieldAlert, Shield, Check, X } from "lucide-react";
import { SecurityAnalysisResult } from "@/hooks/useSecurityAnalysis";
import { motion } from "framer-motion";

interface EnhancedSecurityWarningProps {
  securityResult: SecurityAnalysisResult;
  onIgnore?: () => void;
  onVerify?: () => void;
}

export function EnhancedSecurityWarning({ 
  securityResult, 
  onIgnore,
  onVerify
}: EnhancedSecurityWarningProps) {
  if (!securityResult.status || securityResult.status === "processing" || securityResult.status === "verified") {
    return null;
  }
  
  const { threatLevel, details } = securityResult;
  const isHigh = threatLevel === "high";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={`p-3 sm:p-4 rounded-lg ${
        isHigh 
          ? "bg-red-500/10 border border-red-500/30" 
          : "bg-yellow-500/10 border border-yellow-500/30"
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {isHigh ? (
            <ShieldAlert className={`h-6 w-6 ${isHigh ? "text-red-400" : "text-yellow-400"}`} />
          ) : (
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
          )}
        </div>
        
        <div className="flex-1">
          <p className={`text-base font-medium ${isHigh ? "text-red-200" : "text-yellow-200"}`}>
            {isHigh ? "High Security Risk Detected" : "Security Warning"}
          </p>
          
          <p className={`text-sm mt-1 ${isHigh ? "text-red-200/80" : "text-yellow-200/80"}`}>
            {details.reason || "This transaction has unusual characteristics."}
          </p>
          
          {details.recommendedAction && (
            <div className="flex items-start gap-2 mt-2">
              <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-200/80">
                {details.recommendedAction}
              </p>
            </div>
          )}
          
          {details.confidenceScore !== undefined && (
            <div className="mt-3 bg-black/20 rounded-full h-2">
              <div 
                className={`h-full rounded-full ${
                  details.confidenceScore > 80 ? "bg-red-500" : 
                  details.confidenceScore > 60 ? "bg-yellow-500" : 
                  "bg-blue-500"
                }`} 
                style={{ width: `${details.confidenceScore}%` }}
              />
            </div>
          )}
          
          {(onIgnore || onVerify) && (
            <div className="flex gap-2 mt-3">
              {onVerify && (
                <button
                  onClick={onVerify}
                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-colors"
                >
                  <Check className="h-3.5 w-3.5" /> Review & Verify
                </button>
              )}
              
              {onIgnore && (
                <button
                  onClick={onIgnore}
                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/70 text-xs font-medium transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> Proceed Anyway
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
