
import { motion } from "framer-motion";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { SimplifiedRecipientFinder } from "../SimplifiedRecipientFinder";

interface RecipientSelectionStepProps {
  selectedRecipient: FavoriteRecipient | null;
  onSelectRecipient: (recipient: FavoriteRecipient) => void;
}

export function RecipientSelectionStep({ 
  selectedRecipient, 
  onSelectRecipient 
}: RecipientSelectionStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {selectedRecipient ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{selectedRecipient.recipient_name}</h3>
                <p className="text-sm text-white/70">{selectedRecipient.relationship || 'Contact'}</p>
              </div>
              <div className="text-green-400">
                ✓ Selected
              </div>
            </div>
          </div>
          <p className="text-center text-white/70 text-sm">
            Great! You can proceed to enter the amount or select a different recipient below.
          </p>
        </div>
      ) : (
        <div className="text-center mb-4">
          <p className="text-white/70">Search for a contact or enter recipient details</p>
        </div>
      )}
      
      <SimplifiedRecipientFinder 
        onSelectRecipient={onSelectRecipient}
      />
    </motion.div>
  );
}
