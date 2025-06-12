
import { Badge } from "@/components/ui/badge";
import { Network } from "lucide-react";

export function TestnetBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-lg text-white text-center py-2 px-4 relative z-50">
      <div className="flex items-center justify-center gap-2">
        <Network className="h-4 w-4" />
        <span className="text-sm font-medium">
          Running on Stellar Testnet - Free transfers for development & testing
        </span>
        <Badge variant="secondary" className="bg-white/20 text-white">
          Testnet
        </Badge>
      </div>
    </div>
  );
}
