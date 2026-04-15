import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from '../services/PaymentService';

vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
    functions: { invoke: vi.fn() }
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}));

describe('PaymentService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('../integrations/supabase/client');
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123' } }
    });
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent successfully', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.functions.invoke as any).mockResolvedValue({
        data: {
          orderId: 'order-123',
          paymentIntentId: 'pi-123',
          clientSecret: 'cs-123'
        },
        error: null
      });

      const result = await PaymentService.createPaymentIntent(1000);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('order-123');
      expect(result?.amount).toBe(1000);
      expect(result?.currency).toBe('usd');
      expect(result?.client_secret).toBe('cs-123');
    });

    it('should return null when user is not authenticated', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await PaymentService.createPaymentIntent(1000);

      expect(result).toBeNull();
    });

    it('should return null when the edge function returns an error', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: { message: 'Edge function unavailable' }
      });

      const result = await PaymentService.createPaymentIntent(1000);

      expect(result).toBeNull();
    });

    it('should return null when the call throws', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.functions.invoke as any).mockRejectedValue(new Error('Network error'));

      const result = await PaymentService.createPaymentIntent(500);

      expect(result).toBeNull();
    });

    it('should derive amount and metadata correctly', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.functions.invoke as any).mockResolvedValue({
        data: { orderId: 'o-1', paymentIntentId: 'pi-1', clientSecret: 'cs-1' },
        error: null
      });

      const result = await PaymentService.createPaymentIntent(5000);

      expect(result?.metadata.purpose).toBe('account_funding');
      expect(result?.user_id).toBe('user-123');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment successfully', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.functions.invoke as any).mockResolvedValue({
        data: { success: true, amount: 10 },
        error: null
      });

      const result = await PaymentService.confirmPayment('pi-123', 'order-123');

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await PaymentService.confirmPayment('pi-123');

      expect(result).toBe(false);
    });

    it('should return false when payment is not marked successful', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.functions.invoke as any).mockResolvedValue({
        data: { success: false, error: 'Card declined' },
        error: null
      });

      const result = await PaymentService.confirmPayment('pi-123');

      expect(result).toBe(false);
    });

    it('should return false when the edge function errors', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: { message: 'Function error' }
      });

      const result = await PaymentService.confirmPayment('pi-123');

      expect(result).toBe(false);
    });

    it('should return false when the call throws', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.functions.invoke as any).mockRejectedValue(new Error('Network'));

      const result = await PaymentService.confirmPayment('pi-123');

      expect(result).toBe(false);
    });
  });

  describe('getFundingTransactions', () => {
    it('should return funding transactions', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const mockData = [
        { id: 'tx-1', amount_usd: 100, status: 'completed' },
        { id: 'tx-2', amount_usd: 200, status: 'completed' }
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null })
      });

      const result = await PaymentService.getFundingTransactions();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('tx-1');
    });

    it('should return empty array when not authenticated', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await PaymentService.getFundingTransactions();

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('DB error')
        })
      });

      const result = await PaymentService.getFundingTransactions();

      expect(result).toEqual([]);
    });
  });

  describe('getPaymentIntent', () => {
    it('should return the payment intent for a given id', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      const mockData = { id: 'intent-1', amount: 100, currency: 'usd' };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockData, error: null })
      });

      const result = await PaymentService.getPaymentIntent('intent-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('intent-1');
    });

    it('should return null when not authenticated', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await PaymentService.getPaymentIntent('intent-1');

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      const { supabase } = await import('../integrations/supabase/client');

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Not found')
        })
      });

      const result = await PaymentService.getPaymentIntent('bad-id');

      expect(result).toBeNull();
    });
  });

  describe('getTestCards', () => {
    it('should return exactly 4 test cards', () => {
      const cards = PaymentService.getTestCards();
      expect(cards).toHaveLength(4);
    });

    it('should include Visa Success and Visa Declined cards', () => {
      const cards = PaymentService.getTestCards();
      const names = cards.map((c) => c.name);
      expect(names).toContain('Visa Success');
      expect(names).toContain('Visa Declined');
    });

    it('should have required fields on each card', () => {
      const cards = PaymentService.getTestCards();
      cards.forEach((card) => {
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('number');
        expect(card).toHaveProperty('expiry');
        expect(card).toHaveProperty('cvc');
      });
    });
  });

  describe('processPayment (deprecated)', () => {
    it('should return success for backward compatibility', async () => {
      const result = await PaymentService.processPayment('cs-abc', {});
      expect(result.success).toBe(true);
    });
  });
});
