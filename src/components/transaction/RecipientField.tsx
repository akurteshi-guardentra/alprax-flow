
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RecipientSelector } from "@/components/RecipientSelector";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { RecipientDisplay } from "./RecipientDisplay";
import { cn } from "@/lib/utils";

interface RecipientFieldProps {
  selectedRecipient: FavoriteRecipient | null;
  setSelectedRecipient: (recipient: FavoriteRecipient | null) => void;
  setCountryCode: (country: string | undefined) => void;
  className?: string;
}

export function RecipientField({ 
  selectedRecipient, 
  setSelectedRecipient, 
  setCountryCode,
  className 
}: RecipientFieldProps) {
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);

  const handleSelectRecipient = (recipient: FavoriteRecipient) => {
    setSelectedRecipient(recipient);
    setShowRecipientSelector(false);
    
    // Only set country code if recipient has a country
    if (recipient?.country) {
      // Ensure correct format and handle any edge cases
      const country = recipient.country.toUpperCase().trim();
      if (country.length === 2) { // Most country codes are 2 letters
        setCountryCode(country);
      } else {
        // If country code is invalid, don't set it
        setCountryCode(undefined);
      }
    } else {
      // If recipient has no country, clear the country code
      setCountryCode(undefined);
    }
  };

  return (
    <div className={cn("space-y-2", className || "")}>
      <Label className="text-white">Recipient</Label>
      {showRecipientSelector ? (
        <div className="space-y-3">
          <RecipientSelector 
            onSelectRecipient={handleSelectRecipient}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full border-white/20 bg-transparent hover:bg-white/10 text-white"
            onClick={() => setShowRecipientSelector(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedRecipient ? (
            <RecipientDisplay 
              recipient={selectedRecipient}
              onChangeClick={() => {
                setSelectedRecipient(null);
                setCountryCode(undefined);
                setShowRecipientSelector(true);
              }}
            />
          ) : (
            <Button
              type="button"
              className="w-full bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setShowRecipientSelector(true)}
            >
              Select Recipient
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
