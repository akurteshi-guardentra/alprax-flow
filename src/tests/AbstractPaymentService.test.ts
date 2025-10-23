import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AbstractPaymentService } from '../services/payment/AbstractPaymentService';
import { supabase } from '../integrations/supabase/client';

// Mock Supabase
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn()
  }
}));

// Mock StellarService
vi.mock('../services/stellar', () => ({
  StellarService: {
    sendPayment: vi.fn().mockResolvedValue({
      success: true,
      hash: 'mock-tx-hash-123'
    }),
    getAccountDetails: vi.fn().mockResolvedValue({
      id: 'mock-account',
      balances: [{ asset_type: 'native', balance: '1000' }]
    })
  }
}));

// Mock currency conversion
vi.mock('../lib/currency/abstractionLayer', () => ({
  convertXLMToFiat: vi.fn().mockResolvedValue(50.25),
  convertFiatToXLM: vi.fn().mockResolvedValue('100'),
  getCurrentExchangeRate: vi.fn().mockResolvedValue(0.5025)
}));

describe('AbstractPaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } }
    });

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'stellar-account-id',
          public_key: 'MOCK_PUBLIC_KEY',
          encrypted_secret: 'MOCK_ENCRYPTED_SECRET'
        }
      }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis()
    });
  });

  describe('sendPayment', () => {
    it('should send payment successfully with USD amount', async () => {
      const result = await AbstractPaymentService.sendPayment({
        recipientId: 'recipient-user-id',
        amount: 100,
        currency: 'USD',
        memo: 'Test payment'
      });

      expect(result.success).toBe(true);
      expect(result.confirmationId).toBeDefined();
    });

    it('should handle payment failure gracefully', async () => {
      const { StellarService } = await import('../services/stellar');
      (StellarService.sendPayment as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await AbstractPaymentService.sendPayment({
        recipientId: 'recipient-user-id',
        amount: 50,
        currency: 'USD'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should convert currency correctly', async () => {
      const { convertFiatToXLM } = await import('../lib/currency/abstractionLayer');
      
      await AbstractPaymentService.sendPayment({
        recipientId: 'recipient-user-id',
        amount: 100,
        currency: 'EUR'
      });

      expect(convertFiatToXLM).toHaveBeenCalledWith(100, 'EUR');
    });

    it('should record transaction in database', async () => {
      await AbstractPaymentService.sendPayment({
        recipientId: 'recipient-user-id',
        amount: 75,
        currency: 'USD',
        memo: 'Database test'
      });

      expect(supabase.from).toHaveBeenCalledWith('transactions');
    });
  });

  describe('getBalance', () => {
    it('should fetch balance in fiat currency', async () => {
      const balance = await AbstractPaymentService.getBalance();

      expect(balance).toBeDefined();
      expect(balance.amount).toBeGreaterThanOrEqual(0);
      expect(balance.currency).toBe('USD');
    });
  });
});
