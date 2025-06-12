
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, User, DollarSign } from "lucide-react";
import { FavoriteRecipient } from "@/types/favoriteRecipient";

interface PurposeReviewStepProps {
  description: string;
  setDescription: (description: string) => void;
  selectedRecipient: FavoriteRecipient | null;
  amount: string;
  defaultFiat: string;
}

export function PurposeReviewStep({
  description,
  setDescription,
  selectedRecipient,
  amount,
  defaultFiat
}: PurposeReviewStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Payment Summary */}
      <div className="space-y-3">
        <h3 className="text-white font-medium mb-3">Payment Summary</h3>
        
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
          <User className="h-4 w-4 text-blue-400" />
          <div>
            <p className="text-white font-medium">{selectedRecipient?.recipient_name}</p>
            <p className="text-white/60 text-sm">{selectedRecipient?.relationship || 'Contact'}</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
          <DollarSign className="h-4 w-4 text-green-400" />
          <div>
            <p className="text-white font-medium">{amount} {defaultFiat}</p>
            <p className="text-white/60 text-sm">Payment amount</p>
          </div>
        </div>
      </div>

      {/* Purpose Input */}
      <div className="space-y-2">
        <Label className="text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          What's this payment for?
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter the purpose of this payment (e.g., 'Dinner split', 'Rent payment', 'Gift')"
          className="min-h-[100px] bg-white/10 border-white/20 text-white"
        />
        <p className="text-white/50 text-xs">
          This helps you and the recipient understand what the payment is for
        </p>
      </div>

      {/* Security Notice */}
      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <p className="text-blue-300 text-sm">
          <strong>Almost ready!</strong> Review your details above and add a purpose to continue.
        </p>
      </div>
    </motion.div>
  );
}
