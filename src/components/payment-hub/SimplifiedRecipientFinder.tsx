import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Plus, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AbstractRecipientService, UserRecipient } from '@/services/recipient/AbstractRecipientService';

interface SimplifiedRecipientFinderProps {
  onSelectRecipient: (recipient: UserRecipient) => void;
  onShowQRScanner?: () => void;
  showValidation?: boolean;
}

export function SimplifiedRecipientFinder({ 
  onSelectRecipient, 
  onShowQRScanner,
  showValidation = false 
}: SimplifiedRecipientFinderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<UserRecipient | null>(null);
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    identifier: '', // email or phone
    country: ''
  });

  // Fetch recipients using AbstractRecipientService
  const { data: favoriteRecipients, isLoading, refetch } = useQuery({
    queryKey: ['user-recipients'],
    queryFn: async () => {
      const recipients = await AbstractRecipientService.getRecipients();
      return recipients;
    },
    enabled: !isAddingNew
  });

  // Filter recipients based on search query
  const filteredRecipients = favoriteRecipients?.filter(recipient => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      recipient.name.toLowerCase().includes(query) ||
      recipient.identifier.toLowerCase().includes(query) ||
      recipient.country.toLowerCase().includes(query)
    );
  });

  // Validate email or phone format
  const validateIdentifier = (identifier: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return emailRegex.test(identifier) || phoneRegex.test(identifier);
  };

  const handleRecipientClick = async (recipient: UserRecipient) => {
    setSelectedRecipient(recipient);
    onSelectRecipient(recipient);
  };

  const handleAddRecipient = useCallback(async () => {
    if (!newRecipient.name || !newRecipient.identifier) {
      toast.error('Please fill in required fields');
      return;
    }

    // Validate identifier format
    if (!validateIdentifier(newRecipient.identifier)) {
      toast.error('Please enter a valid email address or phone number (with country code)');
      return;
    }

    try {
      const recipient = await AbstractRecipientService.addRecipient(
        newRecipient.identifier,
        newRecipient.name,
        newRecipient.country || 'Unknown'
      );

      if (recipient) {
        toast.success('Recipient added successfully');
        handleRecipientClick(recipient);
        setIsAddingNew(false);
        setNewRecipient({ name: '', identifier: '', country: '' });
        refetch(); // Refresh the recipients list
      } else {
        toast.error('Failed to add recipient. Please check the email/phone is registered.');
      }
    } catch (error) {
      console.error('Error adding recipient:', error);
      toast.error('Failed to add recipient');
    }
  }, [newRecipient, refetch]);

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
            <label className="block text-sm text-white/70 mb-1">Email or Phone *</label>
            <Input
              value={newRecipient.identifier}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, identifier: e.target.value }))}
              placeholder="email@example.com or +1234567890"
              className="bg-white/10 border-white/20 text-white"
            />
            <p className="text-xs text-white/40 mt-1">Recipient must be registered with us</p>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Country (Optional)</label>
            <Input
              value={newRecipient.country}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, country: e.target.value }))}
              placeholder="United States"
              className="bg-white/10 border-white/20 text-white"
            />
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
            placeholder="Search recipients by name or email..."
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
        ) : filteredRecipients && filteredRecipients.length > 0 ? (
          filteredRecipients.map((recipient) => (
            <Card
              key={recipient.id}
              className="p-3 bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
              onClick={() => handleRecipientClick(recipient)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white text-sm">{recipient.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {recipient.identifierType === 'email' ? '📧' : '📱'}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/50 truncate">
                    {recipient.identifier}
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
              onClick={() => {
                if (validateIdentifier(searchQuery.trim())) {
                  setNewRecipient(prev => ({ ...prev, identifier: searchQuery.trim() }));
                }
                setIsAddingNew(true);
              }}
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