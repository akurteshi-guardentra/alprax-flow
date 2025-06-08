
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { stellar } from '@/lib/stellar';
import { createBatchTransferRecord, createBatchTransferItems, updateBatchStatus } from '@/services/batchTransferService';
import type { CreateBatchTransferInput } from '@/types/batchTransfers';

export function useBatchTransfers() {
  const queryClient = useQueryClient();
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchSuccessCount, setBatchSuccessCount] = useState(0);
  const [batchTotalCount, setBatchTotalCount] = useState(0);

  // Mutation for creating a batch transfer record
  const createBatchTransfer = useMutation({
    mutationFn: async (batchData: CreateBatchTransferInput) => {
      // Calculate total amount
      const totalAmount = batchData.transfers.reduce((sum, item) => sum + item.amount, 0);

      // Create batch record
      const batchRecord = await createBatchTransferRecord(
        batchData.name,
        batchData.description,
        totalAmount,
        batchData.transfers.length
      );

      // Create batch items
      await createBatchTransferItems(batchRecord.id, batchData.transfers);

      return batchRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-transfers'] });
      toast.success('Batch transfer created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create batch transfer: ${error.message || 'Unknown error'}`);
      console.error('Create batch transfer error:', error);
    },
  });

  const sendBatchPayments = useMutation({
    mutationFn: async (payments: { destination: string; amount: string }[]) => {
      setIsBatchSending(true);
      setBatchError(null);
      setBatchSuccessCount(0);
      setBatchTotalCount(payments.length);

      try {
        for (const payment of payments) {
          // Validate the inputs before sending
          if (!payment.destination || payment.destination.trim() === '') {
            throw new Error('Recipient address cannot be empty');
          }

          if (!payment.amount || parseFloat(payment.amount) <= 0) {
            throw new Error('Amount must be greater than 0');
          }

          await stellar.sendPayment(payment.destination, payment.amount);
          setBatchSuccessCount((prev) => prev + 1);
        }
        toast.success('Batch payments sent successfully');
      } catch (error: any) {
        console.error('Batch Payment error:', error);
        setBatchError(error.message || 'Failed to send batch payments');
        toast.error(`Batch payment failed: ${error.message || 'Unknown error'}`);
        throw error; // Re-throw to let useMutation handle the error state
      } finally {
        setIsBatchSending(false);
      }
    },
    onSuccess: () => {
      // No need to invalidate queries here, as individual sendPayment calls already do that
    },
    onError: (error: any) => {
      console.error('Batch Payment error:', error);
      toast.error(`Batch payment failed: ${error.message || 'Unknown error'}`);
    },
  });

  return {
    isBatchSending,
    batchError,
    batchSuccessCount,
    batchTotalCount,
    createBatchTransfer: createBatchTransfer.mutate,
    isCreating: createBatchTransfer.isPending,
    sendBatchPayments: sendBatchPayments.mutate,
    resetBatchState: () => {
      setIsBatchSending(false);
      setBatchError(null);
      setBatchSuccessCount(0);
      setBatchTotalCount(0);
    },
  };
}
