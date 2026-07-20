
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Send, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { useNavigate } from 'react-router-dom';
import { FavoriteRecipient } from '@/types/favoriteRecipient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hapticFeedback } from '@/lib/haptics';

const SAMPLE_RECIPIENTS = [
  {
    recipient_name: 'Alice Johnson',
    stellar_address: 'GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3',
    country: 'US',
    currency: 'USD',
    relationship: 'Friend',
  },
  {
    recipient_name: 'Bob Smith',
    stellar_address: 'GCKFBEIYTKP5RDBQMUAOXBJUYJ6NNYJ4OQXQZM7SZLCUQHGWL2MRZQKE',
    country: 'GB',
    currency: 'GBP',
    relationship: 'Family',
  },
];

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<FavoriteRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const addSampleRecipients = async () => {
    try {
      setIsSeeding(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in first');
        return;
      }
      const rows = SAMPLE_RECIPIENTS.map((r) => ({ ...r, user_id: user.id }));
      const { data, error } = await supabase
        .from('favorite_recipients')
        .insert(rows)
        .select();
      if (error) throw error;
      setContacts((prev) => [...prev, ...(data || [])].sort((a, b) => a.recipient_name.localeCompare(b.recipient_name)));
      toast.success(`Added ${data?.length ?? 0} sample recipients`);
    } catch (err: any) {
      console.error('Seed error', err);
      toast.error(err?.message || 'Failed to add sample recipients');
    } finally {
      setIsSeeding(false);
    }
  };

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
        .order('recipient_name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMoney = (contact: FavoriteRecipient) => {
    hapticFeedback('light');
    navigate('/payments', { 
      state: { selectedContact: contact } 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Contacts</h1>
              <p className="text-white/70">Manage your favorite recipients</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/add-contact')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </motion.div>

        {/* Contacts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ModernCard variant="glass">
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                My Contacts ({contacts.length})
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              {isLoading ? (
                <div className="text-center py-8 text-white/60">
                  Loading contacts...
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No contacts yet</h3>
                  <p className="text-white/60 mb-4">Add your first contact to get started</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      onClick={() => navigate('/add-contact')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contact
                    </Button>
                    <Button
                      onClick={addSampleRecipients}
                      disabled={isSeeding}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {isSeeding ? 'Adding…' : 'Add 2 sample recipients'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full ${getAvatarColor(contact.recipient_name)} flex items-center justify-center`}>
                            <span className="text-white font-medium">
                              {getInitials(contact.recipient_name)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{contact.recipient_name}</h3>
                            <p className="text-sm text-white/60">
                              {contact.relationship || 'Contact'} • {contact.country} • {contact.currency}
                            </p>
                            {contact.last_sent_at && (
                              <p className="text-xs text-white/40">
                                Last payment: {new Date(contact.last_sent_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSendMoney(contact)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Contacts;
