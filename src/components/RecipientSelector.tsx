import { useState, useEffect, useMemo } from "react";
import { useFavoriteRecipients, CreateRecipientInput } from "@/hooks/useFavoriteRecipients";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, UserPlus, X, RefreshCw } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CountrySelector } from "./CountrySelector";
import { toast } from "sonner";

interface RecipientSelectorProps {
  onSelectRecipient: (recipient: FavoriteRecipient) => void;
}

export function RecipientSelector({ onSelectRecipient }: RecipientSelectorProps) {
  const { recipients, isLoading, recipientsError, refetchRecipients, addRecipient, isAdding } = useFavoriteRecipients();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState<Partial<CreateRecipientInput>>({
    recipient_name: "",
    stellar_address: "",
    country: "",
    currency: "USD",
    relationship: "Friend"
  });
  
  // Default test recipient to show when user's list is empty
  const defaultTestRecipient: FavoriteRecipient = {
    id: "test_recipient_default",
    user_id: "system",
    recipient_name: "Test Recipient",
    stellar_address: "GBFLT4E5RW6MDMZ7VWVGHX5HYJKDMQFSYUCT5EIIBUB3GWVSIGKPAPYT", // Example testnet address
    country: "US",
    currency: "XLM",
    relationship: "Test",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Combine user's recipients with default test recipient when empty
  const allRecipients = useMemo(() => {
    if (recipients && recipients.length > 0) {
      return recipients; // Use actual recipients when available
    }
    return [defaultTestRecipient]; // Use default test recipient when empty
  }, [recipients]);
  
  // Debug log for recipients
  useEffect(() => {
    console.log("Recipients in component:", recipients);
    if (recipientsError) {
      console.error("Error fetching recipients:", recipientsError);
    }
  }, [recipients, recipientsError]);

  const handleRefresh = () => {
    refetchRecipients();
    toast.info("Refreshing recipients list...");
  };
  
  const handleAddRecipient = () => {
    if (!newRecipient.recipient_name || !newRecipient.stellar_address || !newRecipient.country) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    addRecipient(newRecipient as CreateRecipientInput);
    setShowAddForm(false);
    setNewRecipient({
      recipient_name: "",
      stellar_address: "",
      country: "",
      currency: "USD",
      relationship: "Friend"
    });
  };
  
  const handleInputChange = (field: keyof CreateRecipientInput, value: string) => {
    setNewRecipient(prev => ({ ...prev, [field]: value }));
  };
    const filteredRecipients = allRecipients?.filter(recipient => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      recipient.recipient_name.toLowerCase().includes(searchLower) ||
      (recipient.relationship && recipient.relationship.toLowerCase().includes(searchLower))
    );
  });

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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 mr-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />          <Input
            type="text" 
            placeholder="Search by name or relationship"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/60"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {showAddForm ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">Add New Recipient</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowAddForm(false)}
              className="h-8 w-8 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="recipient_name" className="text-white">Name</Label>
              <Input
                id="recipient_name"
                value={newRecipient.recipient_name}
                onChange={(e) => handleInputChange("recipient_name", e.target.value)}
                className="bg-white/10 border-white/10 text-white"
                placeholder="Recipient's name"
              />
            </div>
            
            <div>              <Label htmlFor="stellar_address" className="text-white">Account ID</Label>
              <Input
                id="stellar_address"
                value={newRecipient.stellar_address}
                onChange={(e) => handleInputChange("stellar_address", e.target.value)}
                className="bg-white/10 border-white/10 text-white"
                placeholder="Enter recipient's account ID"
              />
            </div>
            
            <div>
              <Label htmlFor="country" className="text-white">Country</Label>
              <CountrySelector
                value={newRecipient.country}
                onSelect={(value) => handleInputChange("country", value)}
              />
            </div>
            
            <div>
              <Label htmlFor="currency" className="text-white">Currency</Label>
              <Input
                id="currency"
                value={newRecipient.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                className="bg-white/10 border-white/10 text-white"
                placeholder="USD"
              />
            </div>
            
            <div>
              <Label htmlFor="relationship" className="text-white">Relationship (Optional)</Label>
              <Input
                id="relationship"
                value={newRecipient.relationship}
                onChange={(e) => handleInputChange("relationship", e.target.value)}
                className="bg-white/10 border-white/10 text-white"
                placeholder="Friend, Family, Business, etc."
              />
            </div>
            
            <Button
              type="button"
              onClick={handleAddRecipient}
              disabled={isAdding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Recipient
                </>
              )}
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {filteredRecipients && filteredRecipients.length > 0 ? (
            filteredRecipients.map((recipient) => (
              <div 
                key={recipient.id} 
                className={`p-3 rounded-lg border ${recipient.id === 'test_recipient_default' 
                  ? 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'} 
                  transition-colors cursor-pointer`}
                onClick={() => onSelectRecipient(recipient)}
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 border border-white/20">
                    <AvatarImage src={recipient.avatar_url || undefined} alt={recipient.recipient_name} />
                    <AvatarFallback 
                      style={{ backgroundColor: getAvatarColor(recipient.recipient_name) }}
                      className="text-gray-800 font-medium"
                    >
                      {getInitials(recipient.recipient_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className={`font-medium ${recipient.id === 'test_recipient_default' ? 'text-blue-300' : 'text-white'}`}>
                      {recipient.recipient_name}
                      {recipient.id === 'test_recipient_default' && <span className="ml-2 text-xs bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full">Test</span>}
                    </p>
                    <p className="text-white/60 text-sm truncate max-w-[180px]">{recipient.relationship || 'Contact'}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-white/60 mb-3">No matching recipients found</p>
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                onClick={() => {
                  setSearchTerm('');
                  setShowAddForm(true);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Recipient
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
