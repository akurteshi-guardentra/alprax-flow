import { useState } from 'react';
import { Search, UserPlus, Mail, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserDiscoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserSelected?: (user: DiscoveredUser) => void;
}

interface DiscoveredUser {
  user_id: string;
  email: string;
  has_stellar_account: boolean;
}

export function UserDiscoveryModal({ open, onOpenChange, onUserSelected }: UserDiscoveryModalProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<DiscoveredUser | null>(null);
  const [adding, setAdding] = useState(false);

  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    
    setSearching(true);
    try {
      const { data: resp, error } = await supabase.functions.invoke('find-user-by-email', {
        body: { email: searchEmail.trim() },
      });

      if (error) throw error;

      const data = resp?.data as any[] | undefined;
      if (data && data.length > 0) {
        setFoundUser(data[0]);
      } else {
        setFoundUser(null);
        toast.error('User not found or not available for transfers');
      }

    } catch (error) {
      console.error('Error searching for user:', error);
      toast.error('Failed to search for user');
      setFoundUser(null);
    } finally {
      setSearching(false);
    }
  };

  const addToFavorites = async () => {
    if (!foundUser) return;

    setAdding(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get user's stellar address
      const { data: stellarData, error: stellarError } = await supabase
        .from('stellar_accounts')
        .select('public_key')
        .eq('user_id', foundUser.user_id)
        .single();

      if (stellarError || !stellarData) {
        throw new Error('User does not have a Stellar account');
      }

      // Add to favorite recipients
      const { error } = await supabase
        .from('favorite_recipients')
        .insert({
          user_id: user.user.id,
          recipient_name: foundUser.email.split('@')[0], // Use email prefix as name
          stellar_address: stellarData.public_key,
          country: 'Unknown',
          currency: 'USD',
          relationship: 'Contact'
        });

      if (error) throw error;

      toast.success('User added to your recipients!');
      
      if (onUserSelected) {
        onUserSelected(foundUser);
      }
      
      // Reset and close
      setFoundUser(null);
      setSearchEmail('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding user to favorites:', error);
      toast.error('Failed to add user to recipients');
    } finally {
      setAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUser();
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Find User by Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                type="email"
                placeholder="Enter user's email address"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
          </div>

          <Button
            onClick={searchUser}
            disabled={searching || !searchEmail.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {searching ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching...
              </div>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search User
              </>
            )}
          </Button>

          <AnimatePresence>
            {foundUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(foundUser.email)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">
                          {foundUser.email.split('@')[0]}
                        </h4>
                        {foundUser.has_stellar_account && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <p className="text-sm text-white/60">{foundUser.email}</p>
                      <p className="text-xs text-white/50">
                        {foundUser.has_stellar_account ? 'Ready to receive payments' : 'Setting up account...'}
                      </p>
                    </div>
                  </div>
                </div>

                {foundUser.has_stellar_account ? (
                  <Button
                    onClick={addToFavorites}
                    disabled={adding}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {adding ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding...
                      </div>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add to Recipients
                      </>
                    )}
                  </Button>
                ) : (
                  <Alert className="border-yellow-500/20 bg-yellow-500/10">
                    <AlertDescription className="text-yellow-200">
                      This user is still setting up their account. They'll be available for transfers once complete.
                    </AlertDescription>
                  </Alert>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}