
import { BatchTransfer, BatchTransferItem } from '@/types/batchTransfers';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

export async function fetchBatchTransfers(): Promise<BatchTransfer[]> {
  const { data, error } = await supabase
    .from('batch_transfers')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<BatchTransfer[]>();

  if (error) {
    toast.error('Failed to fetch batch transfers');
    throw error;
  }

  return data;
}

export async function createBatchTransferRecord(
  name: string,
  description: string | undefined,
  totalAmount: number,
  transferCount: number
): Promise<BatchTransfer> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('batch_transfers')
    .insert({
      name,
      description,
      total_amount: totalAmount,
      recipient_count: transferCount,
      user_id: user.user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createBatchTransferItems(
  batchId: string,
  transfers: { recipient_id: string; amount: number }[]
) {
  const { error } = await supabase
    .from('batch_transfer_items')
    .insert(
      transfers.map(transfer => ({
        batch_id: batchId,
        recipient_id: transfer.recipient_id,
        amount: transfer.amount,
      }))
    );

  if (error) throw error;
}

export async function getBatchItems(batchId: string): Promise<BatchTransferItem[]> {
  const { data, error } = await supabase
    .from('batch_transfer_items')
    .select(`
      *,
      favorite_recipients (
        recipient_name,
        stellar_address
      )
    `)
    .eq('batch_id', batchId)
    .returns<BatchTransferItem[]>();

  if (error) {
    toast.error('Failed to fetch batch items');
    throw error;
  }

  return data;
}

export async function updateBatchStatus(
  batchId: string,
  status: 'processing' | 'completed' | 'failed',
  processedAt?: string
) {
  const { error } = await supabase
    .from('batch_transfers')
    .update({
      status,
      ...(processedAt && { processed_at: processedAt })
    })
    .eq('id', batchId);

  if (error) throw error;
}

export async function updateBatchItemStatus(
  itemId: string,
  status: 'completed' | 'failed',
  errorMessage?: string
) {
  const { error } = await supabase
    .from('batch_transfer_items')
    .update({
      status,
      ...(errorMessage && { error_message: errorMessage })
    })
    .eq('id', itemId);

  if (error) throw error;
}
