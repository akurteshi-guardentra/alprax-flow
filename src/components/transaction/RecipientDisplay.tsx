
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { cn } from "@/lib/utils";
import { Copy, Check, Info, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { countries } from "@/lib/countries";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecipientDisplayProps {
  recipient: FavoriteRecipient;
  onChangeClick: () => void;
}

export function RecipientDisplay({ recipient, onChangeClick }: RecipientDisplayProps) {
  const [copied, setCopied] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };
    const copyToClipboard = () => {
    navigator.clipboard.writeText(recipient.recipient_name);
    setCopied(true);
    toast.success("Recipient name copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Format the stellar address for better display
  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  };

  return (
    <div className="flex flex-col bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md p-4 rounded-xl space-y-3 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-white/20 ring-2 ring-white/5 ring-offset-1 ring-offset-black/10">
            <AvatarImage src={recipient.avatar_url || undefined} alt={recipient.recipient_name} />
            <AvatarFallback 
              style={{ backgroundColor: getAvatarColor(recipient.recipient_name) }}
              className="text-gray-800 font-medium text-lg"
            >
              {getInitials(recipient.recipient_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold text-lg">{recipient.recipient_name}</p>
            <p className="text-white/70 text-sm flex items-center">
              {recipient.country && <span className="mr-1">{countries.find(c => c.value === recipient.country)?.flag || recipient.country}</span>}
              {recipient.relationship && <span className="opacity-80">{recipient.relationship}</span>}
            </p>
          </div>
        </div>
        <Button 
          type="button"
          variant="ghost" 
          size="sm"
          className="h-8 px-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
          onClick={onChangeClick}
        >
          Change
        </Button>
      </div>
        <div className="p-3 border border-white/10 rounded-lg bg-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">Account Verified</p>
            <p className="text-green-400 text-xs flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Ready to receive funds
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-white/5 hover:bg-white/10"
                  onClick={() => {
                    const infoEl = document.getElementById('detailed-recipient-info');
                    if (infoEl) {
                      infoEl.classList.toggle('hidden');
                    }
                  }}
                >
                  <Info className="h-4 w-4 text-white/70 hover:text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white border-white/20">
                <p>View technical details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Hidden technical details section */}
        <div id="detailed-recipient-info" className="hidden mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-white/60 font-medium">Payment Network Address</p>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full bg-white/5 hover:bg-white/10"
                onClick={copyToClipboard}
              >
                {copied ? 
                  <Check className="h-3 w-3 text-green-400" /> : 
                  <Copy className="h-3 w-3 text-white/70 hover:text-white" />
                }
              </Button>
            </div>
          </div>          <div className="bg-black/20 p-2 rounded">
            <p className="text-white/60 text-xs font-mono truncate">
              {recipient.country ? `Country: ${recipient.country}` : 'Payment recipient'}
            </p>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Fast, secure international transfers without high fees
          </p>
        </div>
      </div>
    </div>
  );
}
