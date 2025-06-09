
import { Info } from "lucide-react";

interface SecurityWarningProps {
  threatLevel: "low" | "medium" | "high";
}

export function SecurityWarning({ threatLevel }: SecurityWarningProps) {
  return (
    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
      <div className="flex gap-2">
        <Info className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-yellow-200">AI Security Alert: {threatLevel === "medium" ? "Medium" : "High"} Risk Detected</p>
          <p className="text-xs text-yellow-200/70 mt-1">
            {threatLevel === "high" 
              ? "This transaction has been flagged as high risk. Please verify recipient details before proceeding."
              : "This transaction has unusual characteristics. We recommend confirming recipient details before proceeding."}
          </p>
        </div>
      </div>
    </div>
  );
}
