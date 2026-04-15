import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionQueueService } from '../services/TransactionQueueService';

vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn()
  }
}));

vi.mock('@/utils/error-tracking', () => ({
  captureError: vi.fn()
}));

vi.mock('@/services/PaymentErrorService', () => ({
  PaymentErrorService: {
    logError: vi.fn().mockResolvedValue(null)
  }
}));

vi.mock('@/utils/rate-limiting', () => ({
  rateLimiter: { isAllowed: vi.fn().mockReturnValue(true) },
  RATE_LIMITS: {
    PAYMENT: { maxRequests: 5, windowMs: 60_000 },
    TRANSACTION: { maxRequests: 10, windowMs: 60_000 }
  }
}));

const VALID_ADDRESS = 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';

describe('TransactionQueueService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('../integrations/supabase/client');
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123' } }
    });
  });

  // ---------------------------------------------------------------------------
  describe('validateTransactionParams', () => {
    it('should pass for valid params', async () => {
      const result = await TransactionQueueService.validateTransactionParams({
        recipientAddress: VALID_ADDRESS,
        amount: 100
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when recipient address is empty', async () => {
      const result = await TransactionQueueService.validateTransactionParams({
        recipientAddress: '',
        amount: 100
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Recipient address is required');
    });

    it('should fail when amount is zero', async () => {
      const result = await TransactionQueueService.validateTransactionParams({
        recipientAddress: VALID_ADDRESS,
        amount: 0
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Valid amount is required');
    });

    it('should fail when amount is negative', async () => {
      const result = await TransactionQueueService.validateTransactionParams({
        recipientAddress: VALID_ADDRESS,
        amount: -50
      });

      expect(result.valid).toBe(false);
    });

    it('should fail when memo exceeds 28 characters', async () => {
      const result = await TransactionQueueService.validateTransactionParams({
        recipientAddress: VALID_ADDRESS,
        amount: 100,
        memo: 'a'.repeat(29)
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Memo must be 28 characters or less');
    });

    it('should pass with a memo of exactly 28 characters', async () => {
      const result = await TransactionQueueService.validateTransactionParams({
        recipientAddress: VALID_ADDRESS,
        amount: 100,
        memo: 'a'.repeat(28)
      });

      expect(result.valid).toBe(true);
    });

    it('should collect multiple errors simultaneously', async () => {
      const result = await TransactionQueueService.validateTransactionParams({
        recipientAddress: '',
        amount: 0
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ---------------------------------------------------------------------------
  describe('queueTransaction', () => {
    it('should queue a transaction successfully', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const mockTx = {
        id: 'tx-1',
        user_id: 'user-123',
        recipient_address: VALID_ADDRESS,
        amount: 100,
        status: 'pending'
      };

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTx, error: null })
      });

      const result = await TransactionQueueService.queueTransaction({
        recipientAddress: VALID_ADDRESS,
        amount: 100
      });

      expect(result).not.toBeNull();
      expect(result?.id).toBe('tx-1');
      expect(result?.status).toBe('pending');
    });

    it('should return null when user is not authenticated', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await TransactionQueueService.queueTransaction({
        recipientAddress: VALID_ADDRESS,
        amount: 100
      });

      expect(result).toBeNull();
    });

    it('should return null for invalid params', async () => {
      const result = await TransactionQueueService.queueTransaction({
        recipientAddress: '',
        amount: 0
      });

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') })
      });

      const result = await TransactionQueueService.queueTransaction({
        recipientAddress: VALID_ADDRESS,
        amount: 50
      });

      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  describe('updateTransactionStatus', () => {
    it('should update status successfully', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      const result = await TransactionQueueService.updateTransactionStatus(
        'tx-1',
        'completed'
      );

      expect(result).toBe(true);
    });

    it('should auto-set started_at when status is processing', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const updateMock = vi.fn().mockReturnThis();
      (supabase.from as any).mockReturnValue({
        update: updateMock,
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      await TransactionQueueService.updateTransactionStatus('tx-1', 'processing');

      const updateArg = updateMock.mock.calls[0][0];
      expect(updateArg.started_at).toBeDefined();
    });

    it('should auto-set completed_at when status is completed', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const updateMock = vi.fn().mockReturnThis();
      (supabase.from as any).mockReturnValue({
        update: updateMock,
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      await TransactionQueueService.updateTransactionStatus('tx-1', 'completed');

      const updateArg = updateMock.mock.calls[0][0];
      expect(updateArg.completed_at).toBeDefined();
    });

    it('should not override an explicit started_at provided in updates', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const updateMock = vi.fn().mockReturnThis();
      const customStarted = '2024-01-01T00:00:00.000Z';
      (supabase.from as any).mockReturnValue({
        update: updateMock,
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      await TransactionQueueService.updateTransactionStatus('tx-1', 'processing', {
        started_at: customStarted
      } as any);

      const updateArg = updateMock.mock.calls[0][0];
      expect(updateArg.started_at).toBe(customStarted);
    });

    it('should return false on database error', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: new Error('DB error') })
      });

      const result = await TransactionQueueService.updateTransactionStatus(
        'tx-1',
        'failed'
      );

      expect(result).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  describe('incrementAttempts', () => {
    it('should increment attempts successfully', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { attempts: 1 }, error: null })
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null })
        });

      const result = await TransactionQueueService.incrementAttempts('tx-1');

      expect(result).toBe(true);
    });

    it('should return false when the transaction is not found', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      });

      const result = await TransactionQueueService.incrementAttempts('tx-404');

      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('DB error')
        })
      });

      const result = await TransactionQueueService.incrementAttempts('tx-1');

      expect(result).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  describe('getPendingTransactions', () => {
    it('should return pending and processing transactions', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const mockTxs = [
        { id: 'tx-1', status: 'pending' },
        { id: 'tx-2', status: 'processing' }
      ];

      // The service chains two .order() calls; model the chain accordingly.
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockTxs, error: null })
          })
        })
      });

      const result = await TransactionQueueService.getPendingTransactions();

      expect(result).toHaveLength(2);
    });

    it('should return empty array when not authenticated', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await TransactionQueueService.getPendingTransactions();

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB') })
          })
        })
      });

      const result = await TransactionQueueService.getPendingTransactions();

      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  describe('getUserTransactions', () => {
    it('should return all user transactions', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const mockTxs = [{ id: 'tx-1' }, { id: 'tx-2' }, { id: 'tx-3' }];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockTxs, error: null })
      });

      const result = await TransactionQueueService.getUserTransactions();

      expect(result).toHaveLength(3);
    });

    it('should pass the limit parameter correctly', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const limitMock = vi.fn().mockResolvedValue({ data: [], error: null });
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: limitMock
      });

      await TransactionQueueService.getUserTransactions(10);

      expect(limitMock).toHaveBeenCalledWith(10);
    });

    it('should return empty array when not authenticated', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await TransactionQueueService.getUserTransactions();

      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  describe('retryTransaction', () => {
    it('should retry a transaction successfully', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      const result = await TransactionQueueService.retryTransaction('tx-1');

      expect(result).toBe(true);
    });

    it('should return false on database error', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: new Error('DB error') })
      });

      const result = await TransactionQueueService.retryTransaction('bad-id');

      expect(result).toBe(false);
    });
  });
});
