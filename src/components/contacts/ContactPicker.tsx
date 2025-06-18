
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { FavoriteRecipient } from '@/types/favoriteRecipient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactPickerProps {
  onSelectContact: (contact: FavoriteRecipient) => void;
  onClose: () => void;
}

export function ContactPicker({ onSelectContact, onClose }: ContactPickerProps) {
  const [contacts, setContacts] = useState<FavoriteRecipient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorite_recipients')
        .select('*')
        .eq('user_id', user.id)
        .order('last_sent_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.relationship?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <ModernCard variant="glass" className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Select Contact</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>

        <ModernCardContent className="p-0 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-white/60">Loading contacts...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-white/60">
              {searchTerm ? 'No contacts found' : 'No contacts yet'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  className="w-full p-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-300">
                        {getInitials(contact.recipient_name)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{contact.recipient_name}</div>
                      <div className="text-sm text-white/60">
                        {contact.relationship || 'Contact'} • {contact.country}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
    </motion.div>
  );
}
