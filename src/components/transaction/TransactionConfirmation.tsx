import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Check, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CurrencySymbol } from "@/components/CurrencyDisplay";
import { motion } from "framer-motion";

interface TransactionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  recipient: FavoriteRecipient;
  amount: string; // This will be fiatAmount
  description: string;
  paymentMethod: string;
  securityCheck: "verified" | "warning";
  threatLevel: "low" | "medium" | "high";
  defaultFiat: string; // Added defaultFiat
}

export function TransactionConfirmation({
  isOpen,
  onClose,
  onConfirm,
  recipient,
  amount, // fiatAmount
  description,
  paymentMethod,
  securityCheck,
  threatLevel,
  defaultFiat, // Added
}: TransactionConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      // Success is handled by the parent component
    } catch (error) {
      console.error("Transaction error:", error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
  
  const paymentMethods = {
    "card": "Credit Card",
    "bank": "Bank Transfer",
    "mobile": "Mobile Money",
    "wallet": "Digital Wallet"
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Confirm Transaction
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Please review the transaction details before sending money.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-1">Recipient</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-600">
                  <AvatarImage src={recipient.avatar_url || undefined} alt={recipient.recipient_name} />
                  <AvatarFallback 
                    style={{ backgroundColor: getAvatarColor(recipient.recipient_name) }}
                    className="text-gray-800 font-medium"
                  >
                    {getInitials(recipient.recipient_name)}
                  </AvatarFallback>
                </Avatar>                <div>
                  <p className="font-medium">{recipient.recipient_name}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[200px]">
                    {recipient.contact_email || recipient.contact_phone || recipient.relationship || "Contact"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Amount</p>
                <div className="flex items-center gap-1">
                  <CurrencySymbol currency={defaultFiat} className="h-4 w-4 text-white" />
                  <p className="text-lg font-semibold">{amount}</p>
                </div>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Payment Method</p>
                <p className="font-medium">{paymentMethods[paymentMethod as keyof typeof paymentMethods]}</p>
              </div>
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-1">Purpose</p>
              <p>{description}</p>
            </div>
            
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              securityCheck === "verified" 
                ? "bg-green-900/20 border border-green-900/30" 
                : "bg-yellow-900/20 border border-yellow-900/30"
            }`}>
              {securityCheck === "verified" ? (
                <>
                  <Check className="h-4 w-4 text-green-400" />
                  <p className="text-sm text-green-300">This transaction has passed security checks</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <p className="text-sm text-yellow-300">
                    {threatLevel === "high" 
                      ? "High risk detected - proceed with caution" 
                      : "Medium risk detected - verify recipient details"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto border-slate-600 text-white hover:bg-slate-700"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500/80 to-blue-600/80 hover:from-blue-500/90 hover:to-blue-600/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm and Send
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
