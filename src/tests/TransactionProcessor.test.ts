import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TransactionProcessor } from '../services/TransactionProcessor';

vi.mock('../services/TransactionQueueService', () => ({
  TransactionQueueService: {
    getPendingTransactions: vi.fn(),
    updateTransactionStatus: vi.fn().mockResolvedValue(true),
    incrementAttempts: vi.fn().mockResolvedValue(true),
    retryTransaction: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('@/lib/stellar/payment', () => ({
  sendPayment: vi.fn()
}));

vi.mock('../services/PaymentErrorService', () => ({
  PaymentErrorService: {
    logError: vi.fn().mockResolvedValue(null)
  }
}));

const VALID_ADDRESS = 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';

function makeTx(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tx-1',
    recipient_address: VALID_ADDRESS,
    amount: 100,
    attempts: 0,
    max_attempts: 3,
    metadata: {},
    ...overrides
  };
}

describe('TransactionProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (TransactionProcessor as any).isProcessing = false;
    (TransactionProcessor as any).processingInterval = null;
  });

  afterEach(() => {
    TransactionProcessor.stopAutoProcessing();
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  describe('processQueue', () => {
    it('should do nothing when the queue is empty', async () => {
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );
      (TransactionQueueService.getPendingTransactions as any).mockResolvedValue([]);

      await TransactionProcessor.processQueue();

      expect(TransactionQueueService.updateTransactionStatus).not.toHaveBeenCalled();
    });

    it('should skip if already processing', async () => {
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );
      (TransactionProcessor as any).isProcessing = true;

      await TransactionProcessor.processQueue();

      expect(TransactionQueueService.getPendingTransactions).not.toHaveBeenCalled();
    });

    it('should mark a successful transaction as completed', async () => {
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );
      const { sendPayment } = await import('@/lib/stellar/payment');

      (TransactionQueueService.getPendingTransactions as any).mockResolvedValue([
        makeTx()
      ]);
      (sendPayment as any).mockResolvedValue({ success: true, txHash: 'hash-ok' });

      await TransactionProcessor.processQueue();

      expect(TransactionQueueService.updateTransactionStatus).toHaveBeenCalledWith(
        'tx-1',
        'processing'
      );
      expect(TransactionQueueService.updateTransactionStatus).toHaveBeenCalledWith(
        'tx-1',
        'completed',
        expect.objectContaining({ stellar_tx_hash: 'hash-ok' })
      );
    });

    it('should set transaction back to pending when retries remain', async () => {
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );
      const { sendPayment } = await import('@/lib/stellar/payment');

      (TransactionQueueService.getPendingTransactions as any).mockResolvedValue([
        makeTx({ attempts: 0, max_attempts: 3 })
      ]);
      (sendPayment as any).mockResolvedValue({
        success: false,
        error: 'Network timeout'
      });

      await TransactionProcessor.processQueue();

      expect(TransactionQueueService.incrementAttempts).toHaveBeenCalledWith('tx-1');
      expect(TransactionQueueService.updateTransactionStatus).toHaveBeenCalledWith(
        'tx-1',
        'pending',
        expect.any(Object)
      );
    });

    it('should mark as failed and log error when max attempts are exhausted', async () => {
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );
      const { sendPayment } = await import('@/lib/stellar/payment');
      const { PaymentErrorService } = await import('../services/PaymentErrorService');

      // attempts === max_attempts - 1 means this is the last allowed try
      (TransactionQueueService.getPendingTransactions as any).mockResolvedValue([
        makeTx({ attempts: 2, max_attempts: 3 })
      ]);
      (sendPayment as any).mockResolvedValue({
        success: false,
        error: 'Permanent failure'
      });

      await TransactionProcessor.processQueue();

      expect(TransactionQueueService.updateTransactionStatus).toHaveBeenCalledWith(
        'tx-1',
        'failed',
        expect.any(Object)
      );
      expect(PaymentErrorService.logError).toHaveBeenCalled();
    });

    it('should handle exceptions during processing gracefully', async () => {
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );
      const { sendPayment } = await import('@/lib/stellar/payment');

      (TransactionQueueService.getPendingTransactions as any).mockResolvedValue([
        makeTx()
      ]);
      (sendPayment as any).mockRejectedValue(new Error('Unexpected crash'));

      // Should not throw
      await expect(TransactionProcessor.processQueue()).resolves.not.toThrow();

      expect(TransactionQueueService.incrementAttempts).toHaveBeenCalledWith('tx-1');
    });

    it('should reset isProcessing flag after queue runs', async () => {
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );
      (TransactionQueueService.getPendingTransactions as any).mockResolvedValue([]);

      await TransactionProcessor.processQueue();

      expect((TransactionProcessor as any).isProcessing).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  describe('startAutoProcessing / stopAutoProcessing', () => {
    it('should not start a second interval when already running', async () => {
      vi.useFakeTimers();
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );
      (TransactionQueueService.getPendingTransactions as any).mockResolvedValue([]);

      TransactionProcessor.startAutoProcessing(5000);
      const firstInterval = (TransactionProcessor as any).processingInterval;

      TransactionProcessor.startAutoProcessing(5000);
      const secondInterval = (TransactionProcessor as any).processingInterval;

      expect(firstInterval).toBe(secondInterval);
    });

    it('should clear the interval on stopAutoProcessing', async () => {
      vi.useFakeTimers();
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );
      (TransactionQueueService.getPendingTransactions as any).mockResolvedValue([]);

      TransactionProcessor.startAutoProcessing(5000);
      expect((TransactionProcessor as any).processingInterval).not.toBeNull();

      TransactionProcessor.stopAutoProcessing();
      expect((TransactionProcessor as any).processingInterval).toBeNull();
    });

    it('should do nothing if stopAutoProcessing is called when not running', () => {
      expect(() => TransactionProcessor.stopAutoProcessing()).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('retryTransaction', () => {
    it('should return true when retried and processed successfully', async () => {
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );
      const { sendPayment } = await import('@/lib/stellar/payment');

      (TransactionQueueService.retryTransaction as any).mockResolvedValue(true);
      (TransactionQueueService.getPendingTransactions as any).mockResolvedValue([
        makeTx()
      ]);
      (sendPayment as any).mockResolvedValue({ success: true, txHash: 'h-abc' });

      const result = await TransactionProcessor.retryTransaction('tx-1');

      expect(result).toBe(true);
    });

    it('should return false when retryTransaction service call fails', async () => {
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );

      (TransactionQueueService.retryTransaction as any).mockResolvedValue(false);

      const result = await TransactionProcessor.retryTransaction('tx-1');

      expect(result).toBe(false);
    });

    it('should return false when the transaction is no longer in the queue', async () => {
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );

      (TransactionQueueService.retryTransaction as any).mockResolvedValue(true);
      // Queue is empty – transaction not found
      (TransactionQueueService.getPendingTransactions as any).mockResolvedValue([]);

      const result = await TransactionProcessor.retryTransaction('tx-1');

      expect(result).toBe(false);
    });

    it('should return false on unexpected error', async () => {
      const { TransactionQueueService } = await import(
        '../services/TransactionQueueService'
      );

      (TransactionQueueService.retryTransaction as any).mockRejectedValue(
        new Error('Unexpected')
      );

      const result = await TransactionProcessor.retryTransaction('tx-1');

      expect(result).toBe(false);
    });
  });
});
