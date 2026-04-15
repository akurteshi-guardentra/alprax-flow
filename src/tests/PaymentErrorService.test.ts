import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentErrorService } from '../services/PaymentErrorService';

vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn()
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}));

describe('PaymentErrorService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('../integrations/supabase/client');
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123' } }
    });
  });

  describe('logError', () => {
    it('should log a payment error and return the record', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const mockRecord = {
        id: 'err-1',
        user_id: 'user-123',
        error_type: 'network',
        error_message: 'Network error',
        error_details: {},
        retry_count: 0,
        created_at: new Date().toISOString()
      };

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockRecord, error: null })
      });

      const result = await PaymentErrorService.logError({
        errorType: 'network',
        errorMessage: 'Network error'
      });

      expect(result).not.toBeNull();
      expect(result?.error_type).toBe('network');
      expect(result?.id).toBe('err-1');
    });

    it('should include all optional params in the insert', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const insertMock = vi.fn().mockReturnThis();
      (supabase.from as any).mockReturnValue({
        insert: insertMock,
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'err-2' }, error: null })
      });

      await PaymentErrorService.logError({
        transactionId: 'tx-123',
        errorType: 'balance',
        errorMessage: 'Insufficient funds',
        errorDetails: { balance: 10, required: 100 },
        stellarTxHash: 'abc123',
        retryCount: 2
      });

      expect(supabase.from).toHaveBeenCalledWith('payment_errors');
      const insertArg = insertMock.mock.calls[0][0];
      expect(insertArg.transaction_id).toBe('tx-123');
      expect(insertArg.retry_count).toBe(2);
      expect(insertArg.stellar_tx_hash).toBe('abc123');
    });

    it('should return null when user is not authenticated', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await PaymentErrorService.logError({
        errorType: 'unknown',
        errorMessage: 'Test error'
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

      const result = await PaymentErrorService.logError({
        errorType: 'stellar',
        errorMessage: 'Stellar error'
      });

      expect(result).toBeNull();
    });
  });

  describe('getUserErrors', () => {
    it('should return a list of user errors', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const mockErrors = [
        { id: 'err-1', error_type: 'network' },
        { id: 'err-2', error_type: 'balance' }
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockErrors, error: null })
      });

      const result = await PaymentErrorService.getUserErrors();

      expect(result).toHaveLength(2);
    });

    it('should pass the limit argument to the query', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const limitMock = vi.fn().mockResolvedValue({ data: [], error: null });
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: limitMock
      });

      await PaymentErrorService.getUserErrors(10);

      expect(limitMock).toHaveBeenCalledWith(10);
    });

    it('should return empty array when not authenticated', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await PaymentErrorService.getUserErrors();

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') })
      });

      const result = await PaymentErrorService.getUserErrors();

      expect(result).toEqual([]);
    });
  });

  describe('markErrorResolved', () => {
    it('should mark an error as resolved and return true', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      const result = await PaymentErrorService.markErrorResolved('err-1');

      expect(result).toBe(true);
    });

    it('should return false on database error', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: new Error('Update failed') })
      });

      const result = await PaymentErrorService.markErrorResolved('bad-id');

      expect(result).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return user-friendly message for validation errors', () => {
      const msg = PaymentErrorService.getErrorMessage('validation', 'raw');
      expect(msg).toContain('transaction details');
    });

    it('should return user-friendly message for network errors', () => {
      const msg = PaymentErrorService.getErrorMessage('network', 'raw');
      expect(msg).toContain('connection');
    });

    it('should return user-friendly message for stellar errors', () => {
      const msg = PaymentErrorService.getErrorMessage('stellar', 'raw');
      expect(msg).toContain('Stellar');
    });

    it('should return user-friendly message for balance errors', () => {
      const msg = PaymentErrorService.getErrorMessage('balance', 'raw');
      expect(msg).toContain('Insufficient funds');
    });

    it('should return user-friendly message for unknown errors', () => {
      const msg = PaymentErrorService.getErrorMessage('unknown', 'raw');
      expect(msg).toContain('unexpected');
    });

    it('should fall back to the original message for unrecognised error types', () => {
      const msg = PaymentErrorService.getErrorMessage('custom_type', 'Original error');
      expect(msg).toBe('Original error');
    });
  });

  describe('showUserFriendlyError', () => {
    it('should call toast.error with the user-friendly message', async () => {
      const { toast } = await import('sonner');

      PaymentErrorService.showUserFriendlyError('network', 'raw error');

      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('connection'));
    });

    it('should pass original message for unknown error type', async () => {
      const { toast } = await import('sonner');

      PaymentErrorService.showUserFriendlyError('custom_type', 'My raw error');

      expect(toast.error).toHaveBeenCalledWith('My raw error');
    });
  });
});
