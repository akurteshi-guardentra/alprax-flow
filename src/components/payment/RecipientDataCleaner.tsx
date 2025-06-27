
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function RecipientDataCleaner() {
  const [isCleaning, setIsCleaning] = useState(false);

  const cleanInvalidRecipients = async () => {
    try {
      setIsCleaning(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to clean recipients');
        return;
      }

      // Find and delete recipients with invalid Stellar addresses
      const { data: recipients, error: fetchError } = await supabase
        .from('favorite_recipients')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        throw fetchError;
      }

      const invalidRecipients = recipients?.filter(r => 
        !r.stellar_address?.startsWith('G') || r.stellar_address.length !== 56
      ) || [];

      if (invalidRecipients.length === 0) {
        toast.info('No invalid recipients found');
        return;
      }

      const { error: deleteError } = await supabase
        .from('favorite_recipients')
        .delete()
        .in('id', invalidRecipients.map(r => r.id));

      if (deleteError) {
        throw deleteError;
      }

      toast.success(`Cleaned ${invalidRecipients.length} invalid recipients`);
      
    } catch (error) {
      console.error('Error cleaning recipients:', error);
      toast.error('Failed to clean recipients');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <div>
            <h3 className="text-sm font-medium text-red-400">Invalid Recipients</h3>
            <p className="text-xs text-white/70">Remove recipients with invalid Stellar addresses</p>
          </div>
        </div>
        <Button
          onClick={cleanInvalidRecipients}
          disabled={isCleaning}
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isCleaning ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Cleaning...
            </>
          ) : (
            <>
              <Trash2 className="w-3 h-3 mr-1" />
              Clean Invalid
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
