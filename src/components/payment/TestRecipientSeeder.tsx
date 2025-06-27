
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FavoriteRecipient } from '@/types/favoriteRecipient';

interface TestRecipientSeederProps {
  onRecipientsAdded?: (recipients: FavoriteRecipient[]) => void;
}

export function TestRecipientSeeder({ onRecipientsAdded }: TestRecipientSeederProps) {
  const [isAdding, setIsAdding] = useState(false);

  const TEST_RECIPIENTS = [
    {
      recipient_name: 'Alice Johnson',
      stellar_address: 'GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3',
      country: 'US',
      currency: 'USD',
      relationship: 'Friend'
    },
    {
      recipient_name: 'Bob Smith',
      stellar_address: 'GCKFBEIYTKP5RDBQMUAOXBJUYJ6NNYJ4OQXQZM7SZLCUQHGWL2MRZQKE',
      country: 'GB',
      currency: 'GBP',
      relationship: 'Family'
    },
    {
      recipient_name: 'Maria Garcia',
      stellar_address: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
      country: 'DE',
      currency: 'EUR',
      relationship: 'Colleague'
    }
  ];

  const addTestRecipients = async () => {
    try {
      setIsAdding(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to add test recipients');
        return;
      }

      const recipientsToAdd = TEST_RECIPIENTS.map(recipient => ({
        ...recipient,
        user_id: user.id,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('favorite_recipients')
        .insert(recipientsToAdd)
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.info('Test recipients already exist');
          return;
        }
        throw error;
      }

      toast.success(`Added ${data?.length || 0} test recipients with valid Stellar addresses`);
      
      if (onRecipientsAdded && data) {
        onRecipientsAdded(data);
      }
    } catch (error) {
      console.error('Error adding test recipients:', error);
      toast.error('Failed to add test recipients');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <div>
            <h3 className="text-sm font-medium text-blue-400">Test Recipients</h3>
            <p className="text-xs text-white/70">Add recipients with valid Stellar addresses</p>
          </div>
        </div>
        <Button
          onClick={addTestRecipients}
          disabled={isAdding}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isAdding ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-3 h-3 mr-1" />
              Add Test Recipients
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
