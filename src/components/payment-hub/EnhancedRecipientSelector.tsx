import { useState, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Clock, Plus, Filter, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { FavoriteRecipient } from "@/types/favoriteRecipient";

interface EnhancedRecipientSelectorProps {
  recipients: FavoriteRecipient[];
  onSelectRecipient: (recipient: FavoriteRecipient) => void;
  onAddNew: () => void;
  selectedRecipient?: FavoriteRecipient | null;
  className?: string;
}

type SortType = 'recent' | 'alphabetical' | 'frequent';
type FilterType = 'all' | 'family' | 'friends' | 'business';

export const EnhancedRecipientSelector = memo(function EnhancedRecipientSelector({
  recipients,
  onSelectRecipient,
  onAddNew,
  selectedRecipient,
  className
}: EnhancedRecipientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [filterBy, setFilterBy] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedRecipients = useMemo(() => {
    let filtered = recipients.filter(recipient => {
      const matchesSearch = recipient.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipient.relationship?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
                          (filterBy === 'family' && recipient.relationship?.toLowerCase().includes('family')) ||
                          (filterBy === 'friends' && recipient.relationship?.toLowerCase().includes('friend')) ||
                          (filterBy === 'business' && recipient.relationship?.toLowerCase().includes('business'));
      
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.recipient_name.localeCompare(b.recipient_name);
        case 'recent':
          return new Date(b.last_sent_at || b.created_at || '').getTime() - 
                 new Date(a.last_sent_at || a.created_at || '').getTime();
        case 'frequent':
          // Mock frequent sorting - in real app would track send frequency
          return a.recipient_name.localeCompare(b.recipient_name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [recipients, searchQuery, sortBy, filterBy]);

  const getRecipientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRelationshipColor = (relationship?: string) => {
    if (!relationship) return 'bg-gray-500';
    const lower = relationship.toLowerCase();
    if (lower.includes('family')) return 'bg-green-500';
    if (lower.includes('friend')) return 'bg-blue-500';
    if (lower.includes('business')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input
            placeholder="Search recipients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(sortBy === 'recent' ? 'alphabetical' : 'recent')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <SortDesc className="w-4 h-4 mr-2" />
            {sortBy === 'recent' ? 'Recent' : 'A-Z'}
          </Button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 flex-wrap"
            >
              {(['all', 'family', 'friends', 'business'] as FilterType[]).map(filter => (
                <Button
                  key={filter}
                  variant={filterBy === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterBy(filter)}
                  className={cn(
                    "capitalize",
                    filterBy === filter 
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  )}
                >
                  {filter}
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add New Recipient */}
      <Button
        onClick={onAddNew}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add New Recipient
      </Button>

      {/* Recipients List */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {filteredAndSortedRecipients.map((recipient, index) => (
            <motion.div
              key={recipient.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                selectedRecipient?.id === recipient.id
                  ? "bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              )}
              onClick={() => onSelectRecipient(recipient)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={cn("text-white", getRelationshipColor(recipient.relationship))}>
                    {getRecipientInitials(recipient.recipient_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white truncate">{recipient.recipient_name}</h4>
                    {recipient.last_sent_at && (
                      <Star className="w-3 h-3 text-yellow-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span>{recipient.relationship || 'Contact'}</span>
                    <span>•</span>
                    <span>{recipient.country}</span>
                  </div>
                  
                  {recipient.last_sent_at && (
                    <div className="flex items-center gap-1 text-xs text-white/50 mt-1">
                      <Clock className="w-3 h-3" />
                      Last sent: {new Date(recipient.last_sent_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredAndSortedRecipients.length === 0 && (
          <div className="text-center py-8 text-white/60">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recipients found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
});