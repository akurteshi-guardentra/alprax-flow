// Components for finding recipients easily by email, phone or name
import { useState, useEffect } from "react";
import { Search, X, UserPlus, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserProfile, UserProfileService } from "@/services/UserProfileService";
import { FavoriteRecipient } from "@/types/favoriteRecipient";
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/haptics";
import { Badge } from "@/components/ui/badge";

interface SimplifiedRecipientFinderProps {
  onSelectRecipient: (recipient: FavoriteRecipient) => void;
}

export function SimplifiedRecipientFinder({ onSelectRecipient }: SimplifiedRecipientFinderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [recentRecipients, setRecentRecipients] = useState<FavoriteRecipient[]>([]);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState<string | null>(null);

  // Load recent recipients on mount
  useEffect(() => {
    loadRecentRecipients();
  }, []);

  // Search for users as the user types
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchTerm.trim().length > 2) {
        searchUsers(searchTerm);
      } else if (searchTerm.trim() === "") {
        setSearchResults([]);
      }
    }, 500); // Debounce search for 500ms

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  // Load recent recipients from favorites
  const loadRecentRecipients = async () => {
    try {
      // This would typically come from a dedicated hook or service
      const { data } = await fetch('/api/recent-recipients').then(res => res.json());
      setRecentRecipients(data || []);
    } catch (error) {
      console.error("Error loading recent recipients:", error);
      // Use empty array as fallback
      setRecentRecipients([]);
    }
  };

  // Search for users by email, phone or name
  const searchUsers = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await UserProfileService.findUserByIdentifier(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching for users:", error);
      toast.error("Failed to search for users");
    } finally {
      setIsSearching(false);
    }
  };

  // Add a user to favorites for future use
  const addToFavorites = async (userProfile: UserProfile) => {
    if (isAddingToFavorites) return; // Prevent double submission

    setIsAddingToFavorites(userProfile.id);
    try {
      const favorite = await UserProfileService.addToFavorites(userProfile);
      toast.success(`${userProfile.full_name} added to your recipients`);
      hapticFeedback("success");
      
      // Select the newly added favorite recipient
      onSelectRecipient(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error("Failed to add recipient");
      hapticFeedback("error");
    } finally {
      setIsAddingToFavorites(null);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get an avatar color based on name
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  // Clear the search input and results
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
        <Input
          type="text"
          placeholder="Search by email, phone or name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 bg-white/10 border-white/10 text-white placeholder:text-white/60"
        />
        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search results */}
      {isSearching ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          <p className="text-sm text-white/60 mb-1">Search Results</p>
          {searchResults.map((profile) => (
            <div 
              key={profile.id}
              className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 border border-white/20">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                    <AvatarFallback 
                      style={{ backgroundColor: getAvatarColor(profile.full_name) }}
                      className="text-gray-800 font-medium"
                    >
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-white font-medium">{profile.full_name}</p>
                    <p className="text-white/60 text-sm">
                      {profile.email || profile.phone_number || 'No contact info'}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  size="sm"
                  disabled={isAddingToFavorites === profile.id}
                  onClick={() => addToFavorites(profile)}
                  className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                >
                  {isAddingToFavorites === profile.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <UserPlus className="h-3 w-3 mr-1" />
                  )}
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : searchTerm && searchTerm.length > 2 ? (
        <div className="text-center py-6">
          <p className="text-white/60 mb-2">No users found</p>
          <p className="text-sm text-white/40">
            We couldn't find anyone matching '{searchTerm}'
          </p>
        </div>
      ) : null}

      {/* Recent recipients - show when not actively searching */}
      {!isSearching && searchResults.length === 0 && recentRecipients.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-sm text-white/60 mb-1">Recent Recipients</p>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {recentRecipients.map((recipient) => (
              <div 
                key={recipient.id}
                onClick={() => onSelectRecipient(recipient)}
                className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 border border-white/20">
                      <AvatarFallback 
                        style={{ backgroundColor: getAvatarColor(recipient.recipient_name) }}
                        className="text-gray-800 font-medium"
                      >
                        {getInitials(recipient.recipient_name)}
                      </AvatarFallback>
                    </Avatar>                    <div className="ml-3">
                      <p className="text-white font-medium">{recipient.recipient_name}</p>
                      <p className="text-white/40 text-xs truncate max-w-[180px]">
                        {recipient.relationship || 'Contact'}
                      </p>
                    </div>
                  </div>
                  {recipient.relationship && (
                    <Badge variant="outline" className="bg-slate-700/50 text-white/80 border-slate-600">
                      {recipient.relationship}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
