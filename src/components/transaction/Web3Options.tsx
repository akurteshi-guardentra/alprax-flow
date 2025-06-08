
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Bitcoin, ArrowUpRight, Shield, Lock, AlertTriangle, Cpu } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Web3OptionsProps {
  className?: string;
}

export function Web3Options({ className }: Web3OptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSecurityInfoVisible, setIsSecurityInfoVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleWeb3Transfer = (option: string) => {
    setSelectedOption(option);
    
    setTimeout(() => {
      toast.info(`${option} transfer option will be available in the next update. This will provide enhanced security and lower fees.`);
      setSelectedOption(null);
    }, 800);
  };

  const web3Options = [    { 
      id: 'stellar', 
      name: 'Stellar Network',
      description: 'Low-fee money transfers with high security',
      icon: Bitcoin,
      badgeText: 'Recommended'
    },
    { 
      id: 'ethereum', 
      name: 'Ethereum Network',
      description: 'ERC-20 token transfers with smart contracts',
      icon: Bitcoin,
      badgeText: 'Popular'
    },
    { 
      id: 'solana', 
      name: 'Solana Network',
      description: 'Fast and efficient SPL token transfers',
      icon: Bitcoin,
      badgeText: 'Fast'
    }
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-white flex items-center gap-2">
          Web3 Security Options
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-white/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white border-white/20">
                <p>Blockchain-based transfer options with enhanced security and lower fees</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
        >
          {isExpanded ? "Hide Options" : "Show Options"}
        </Button>
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-3 border border-white/10"
        >
          <div className="text-xs text-white/70 mb-3">
            Use next-generation blockchain technology for faster, more secure transfers with lower fees.
          </div>
          
          {/* AI-powered security information panel */}
          <div 
            className="bg-gradient-to-r from-blue-900/30 to-blue-700/30 border border-blue-700/30 rounded-md p-2.5 mb-3 cursor-pointer"
            onClick={() => setIsSecurityInfoVisible(!isSecurityInfoVisible)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-xs text-white">Advanced Security Features</span>
              </div>
              <div className="flex items-center">
                <Cpu className="h-3 w-3 text-blue-400 mr-1" />
                <span className="text-xs bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300">AI Protected</span>
              </div>
            </div>
            
            {isSecurityInfoVisible && (
              <div className="mt-2 space-y-2 text-xs text-white/80">
                <div className="flex items-start gap-2">
                  <Lock className="h-3 w-3 text-green-400 mt-0.5" />
                  <p>Web3 transactions are secured by quantum-resistant cryptography with multi-layer validation.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Cpu className="h-3 w-3 text-blue-400 mt-0.5" />
                  <p>AI continuously monitors transactions for anomalies and provides real-time security assessments.</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5" />
                  <p>Always verify recipient addresses carefully. Blockchain transactions cannot be reversed.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {web3Options.map(option => (
              <Button 
                key={option.id}
                variant="outline" 
                className="w-full text-sm flex items-center justify-between bg-transparent border-white/20 text-white hover:bg-white/10 relative overflow-hidden"
                onClick={() => handleWeb3Transfer(option.name)}
                disabled={selectedOption === option.name}
              >
                <div className="flex items-center">
                  <option.icon className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <span>{option.name}</span>
                    <p className="text-xs text-white/60">{option.description}</p>
                  </div>
                </div>
                
                {option.badgeText && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {option.badgeText}
                  </span>
                )}
                
                {selectedOption === option.name && (
                  <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                    <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </Button>
            ))}
          </div>
          
          <div className="mt-2 text-xs text-white/70 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            <span>Save up to 80% in transfer fees with AI-optimized blockchain routing</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
