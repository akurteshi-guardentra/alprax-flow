import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Plus, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Recipient {
  id: string;
  recipient_name: string;
  stellar_address: string;
  country: string;
  relationship?: string;
  last_sent_at?: string;
}

interface SimplifiedRecipientFinderProps {
  onSelectRecipient: (recipient: Recipient) => void;
  onShowQRScanner?: () => void;
}

export function SimplifiedRecipientFinder({ 
  onSelectRecipient, 
  onShowQRScanner 
}: SimplifiedRecipientFinderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    stellarAddress: '',
    country: '',
    relationship: ''
  });

  // Fetch favorite recipients
  const { data: favoriteRecipients, isLoading } = useQuery({
    queryKey: ['favorite-recipients', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('favorite_recipients')
        .select('*')
        .order('last_sent_at', { ascending: false, nullsFirst: false });

      if (searchQuery.trim()) {
        query = query.or(`recipient_name.ilike.%${searchQuery}%,stellar_address.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Recipient[];
    },
    enabled: !isAddingNew
  });

  const handleAddRecipient = useCallback(async () => {
    if (!newRecipient.name || !newRecipient.stellarAddress) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('favorite_recipients')
        .insert([{
          user_id: user.id,
          recipient_name: newRecipient.name,
          stellar_address: newRecipient.stellarAddress,
          country: newRecipient.country || 'Unknown',
          currency: 'XLM',
          relationship: newRecipient.relationship
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Recipient added successfully');
      onSelectRecipient(data);
      setIsAddingNew(false);
      setNewRecipient({ name: '', stellarAddress: '', country: '', relationship: '' });
    } catch (error) {
      console.error('Error adding recipient:', error);
      toast.error('Failed to add recipient');
    }
  }, [newRecipient, onSelectRecipient]);

  if (isAddingNew) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Add New Recipient</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingNew(false)}
            className="text-white/70 hover:text-white"
          >
            Cancel
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/70 mb-1">Name *</label>
            <Input
              value={newRecipient.name}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Recipient name"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Stellar Address *</label>
            <Input
              value={newRecipient.stellarAddress}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, stellarAddress: e.target.value }))}
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="bg-white/10 border-white/20 text-white font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/70 mb-1">Country</label>
              <Input
                value={newRecipient.country}
                onChange={(e) => setNewRecipient(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Country"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Relationship</label>
              <Input
                value={newRecipient.relationship}
                onChange={(e) => setNewRecipient(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="Family, Friend, etc."
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleAddRecipient}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Add Recipient
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-6"
    >
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipients or paste Stellar address..."
            className="pl-10 bg-white/10 border-white/20 text-white"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingNew(true)}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
          {onShowQRScanner && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowQRScanner}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <QrCode className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4 text-white/50">Loading recipients...</div>
        ) : favoriteRecipients && favoriteRecipients.length > 0 ? (
          favoriteRecipients.map((recipient) => (
            <Card
              key={recipient.id}
              className="p-3 bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
              onClick={() => onSelectRecipient(recipient)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white text-sm">{recipient.recipient_name}</p>
                    {recipient.relationship && (
                      <Badge variant="secondary" className="text-xs">
                        {recipient.relationship}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-white/50 font-mono truncate">
                    {recipient.stellar_address}
                  </p>
                  <p className="text-xs text-white/40">{recipient.country}</p>
                </div>
              </div>
            </Card>
          ))
        ) : searchQuery.trim() ? (
          <div className="text-center py-8 text-white/50">
            <p>No recipients found for "{searchQuery}"</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsAddingNew(true)}
              className="text-primary hover:text-primary/80 mt-2"
            >
              Add as new recipient
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-white/50">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No saved recipients yet</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsAddingNew(true)}
              className="text-primary hover:text-primary/80 mt-2"
            >
              Add your first recipient
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}