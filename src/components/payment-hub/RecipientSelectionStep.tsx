import { memo, useState } from "react";
import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimplifiedRecipientFinder } from "./SimplifiedRecipientFinder";
import { QRCodeScanner } from "../mobile/QRCodeScanner";

export interface RecipientSelectionStepProps {
  data: Record<string, any>;
  onNext: (data?: any) => void;
  onBack: () => void;
}

export const RecipientSelectionStep = memo(function RecipientSelectionStep({
  data,
  onNext
}: RecipientSelectionStepProps) {
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleRecipientSelect = (recipient: any) => {
    onNext({ 
      recipient: {
        id: recipient.id,
        name: recipient.name,
        identifier: recipient.identifier,
        identifierType: recipient.identifierType,
        country: recipient.country
      }
    });
  };

  const handleQRScan = (result: string) => {
    // Parse QR result - could be payment identifier or URL
    let identifier = result;
    let amount;
    
    // Check if it's a payment URL
    if (result.includes('://') || result.includes('pay')) {
      try {
        const url = new URL(result.replace('web+stellar:', 'https://'));
        identifier = url.searchParams.get('recipient') || url.searchParams.get('destination') || url.pathname.split('/').pop() || result;
        amount = url.searchParams.get('amount');
      } catch {
        // If URL parsing fails, treat as plain identifier
        identifier = result;
      }
    }

    onNext({ 
      recipient: {
        id: `qr_${Date.now()}`,
        name: 'QR Recipient',
        stellar_address: identifier, // Internal use only
        country: 'Unknown',
        relationship: 'Other'
      },
      ...(amount && { amount })
    });
    setShowQRScanner(false);
  };

  if (showQRScanner) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Scan Payment Code</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQRScanner(false)}
            className="text-white/70 hover:text-white"
          >
            Cancel
          </Button>
        </div>
        <QRCodeScanner 
          isOpen={showQRScanner}
          onScan={handleQRScan} 
          onClose={() => setShowQRScanner(false)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center p-6 pb-0">
        <h3 className="text-xl font-semibold text-white mb-2">Choose Recipient</h3>
        <p className="text-white/70">Select who you want to send money to</p>
      </div>

      <SimplifiedRecipientFinder 
        onSelectRecipient={handleRecipientSelect}
        onShowQRScanner={() => setShowQRScanner(true)}
        showValidation={true}
      />
    </motion.div>
  );
});