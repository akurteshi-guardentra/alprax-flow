import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Search, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimplifiedRecipientFinder } from "@/components/transaction/SimplifiedRecipientFinder";
import { FavoriteRecipient } from "@/types/favoriteRecipient";

export interface RecipientSelectionStepProps {
  data: Record<string, any>;
  onNext: (data?: any) => void;
  onBack: () => void;
}

export const RecipientSelectionStep = memo(function RecipientSelectionStep({
  data,
  onNext,
  onBack
}: RecipientSelectionStepProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<FavoriteRecipient | null>(
    data.recipient || null
  );

  const handleRecipientSelect = (recipient: FavoriteRecipient) => {
    setSelectedRecipient(recipient);
  };

  const handleNext = () => {
    if (selectedRecipient) {
      onNext({ 
        recipient: selectedRecipient,
        recipientName: selectedRecipient.recipient_name,
        stellarAddress: selectedRecipient.stellar_address,
        country: selectedRecipient.country,
        relationship: selectedRecipient.relationship
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Who are you sending to?</h3>
        <p className="text-white/70">Search for a contact or enter recipient details</p>
      </div>

      {selectedRecipient && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">{selectedRecipient.recipient_name}</h4>
                <p className="text-sm text-white/70">{selectedRecipient.relationship || 'Contact'}</p>
                <p className="text-xs text-white/60">{selectedRecipient.country}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRecipient(null)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Change
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <SimplifiedRecipientFinder 
          onSelectRecipient={handleRecipientSelect}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedRecipient}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Continue with {selectedRecipient?.recipient_name || 'Recipient'}
        </Button>
      </div>
    </motion.div>
  );
});