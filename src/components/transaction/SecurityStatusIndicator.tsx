
import { Info, Cpu, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SecurityStatusIndicatorProps {
  securityCheck: "processing" | "verified" | "warning" | null;
  threatLevel: "low" | "medium" | "high";
}

export function SecurityStatusIndicator({ securityCheck, threatLevel }: SecurityStatusIndicatorProps) {
  if (!securityCheck) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
            securityCheck === "processing" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
            securityCheck === "verified" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
            "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          }`}>
            {securityCheck === "processing" ? (
              <>
                <Cpu className="h-3.5 w-3.5 animate-pulse" />
                <span className="text-xs">AI Analyzing</span>
              </>
            ) : securityCheck === "verified" ? (
              <>
                <Shield className="h-3.5 w-3.5" />
                <span className="text-xs">Secure</span>
              </>
            ) : (
              <>
                <Info className="h-3.5 w-3.5" />
                <span className="text-xs">Needs Review</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-800 text-white border-none p-3 max-w-[250px]">
          {securityCheck === "processing" ? (
            <p className="text-sm">Our AI is analyzing this transaction for potential security risks.</p>
          ) : securityCheck === "verified" ? (
            <p className="text-sm">Our AI has verified this transaction as low-risk. Your transfer is secure.</p>
          ) : (
            <p className="text-sm">Our AI has flagged this transaction for additional review due to transfer patterns or amount. You can still proceed, but additional verification may be required.</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
