import { memo, useState } from "react";
import { motion } from "framer-motion";
import { EnhancedRecipientSelector } from "./EnhancedRecipientSelector";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { Button } from "@/components/ui/button";

export interface RecipientSelectionStepProps {
  data: Record<string, any>;
  onNext: (data?: any) => void;
  onBack: () => void;
}

// Mock recipients data
const mockRecipients: FavoriteRecipient[] = [
  {
    id: '1',
    user_id: 'user1',
    recipient_name: 'John Doe',
    stellar_address: 'GDLOUHDVACXNO6OKZXKEOOMHVUYYKEWTLBPLSR6BZESJN7Y2A5IX5GJ2',
    country: 'Germany',
    currency: 'EUR',
    relationship: 'Friend',
    created_at: '2024-01-01T00:00:00Z',
    last_sent_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: 'user1',
    recipient_name: 'Jane Smith',
    stellar_address: 'GCLOUHDVACXNO6OKZXKEOOMHVUYYKEWTLBPLSR6BZESJN7Y2A5IX5GJ3',
    country: 'France',
    currency: 'EUR',
    relationship: 'Family',
    created_at: '2024-01-01T00:00:00Z',
    last_sent_at: '2024-06-15T00:00:00Z'
  }
];

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

  const handleAddNew = () => {
    // Open add new recipient dialog
    console.log('Add new recipient');
  };

  const handleNext = () => {
    if (selectedRecipient) {
      onNext({ recipient: selectedRecipient });
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
        <p className="text-white/70">Select a recipient or add a new one</p>
      </div>

      <EnhancedRecipientSelector
        recipients={mockRecipients}
        onSelectRecipient={handleRecipientSelect}
        onAddNew={handleAddNew}
        selectedRecipient={selectedRecipient}
      />

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
          Continue
        </Button>
      </div>
    </motion.div>
  );
});