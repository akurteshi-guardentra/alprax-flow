import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AbstractAccountService } from '../services/account/AbstractAccountService';
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
    createAccount: vi.fn().mockResolvedValue({
      publicKey: 'MOCK_PUBLIC_KEY',
      secretKey: 'MOCK_SECRET_KEY'
    }),
    encryptSecretKey: vi.fn().mockResolvedValue('ENCRYPTED_SECRET'),
    getAccountDetails: vi.fn().mockResolvedValue({
      id: 'MOCK_PUBLIC_KEY',
      balances: [
        { asset_type: 'native', balance: '1000' }
      ]
    })
  }
}));

// Mock currency conversion
vi.mock('../lib/currency/abstractionLayer', () => ({
  convertXLMToFiat: vi.fn().mockResolvedValue(502.50)
}));

describe('AbstractAccountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } }
    });
  });

  describe('getAccount', () => {
    it('should fetch user account with balance in preferred currency', async () => {
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            user_account_id: 'ALF-12345678',
            preferred_currency: 'USD'
          }
        })
      }).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            public_key: 'MOCK_PUBLIC_KEY',
            created_at: new Date().toISOString()
          }
        })
      });

      const account = await AbstractAccountService.getAccount();

      expect(account).toBeDefined();
      expect(account?.balance).toBe(502.50);
      expect(account?.currency).toBe('USD');
      expect(account?.accountId).toBe('ALF-12345678');
    });

    it('should return null when no account exists', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null })
      });

      const account = await AbstractAccountService.getAccount();

      expect(account).toBeNull();
    });

    it('should handle different currencies', async () => {
      const { convertXLMToFiat } = await import('../lib/currency/abstractionLayer');
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            id: 'account-id',
            user_id: 'test-user-id',
            public_key: 'MOCK_PUBLIC_KEY',
            preferred_currency: 'EUR'
          }
        })
      });

      await AbstractAccountService.getAccount();

      expect(convertXLMToFiat).toHaveBeenCalledWith('1000', 'EUR');
    });
  });

  describe('createAccount', () => {
    it('should create a new account successfully', async () => {
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'new-account-id',
            user_id: 'test-user-id',
            public_key: 'MOCK_PUBLIC_KEY',
            user_account_id: 'ALF-NEWACCT1'
          }
        })
      });

      const account = await AbstractAccountService.createAccount('test-user-id');

      expect(account).toBeDefined();
      expect(account.accountId).toBe('ALF-NEWACCT1');
    });
  });

  describe('updatePreferredCurrency', () => {
    it('should update user preferred currency', async () => {
      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      const success = await AbstractAccountService.updatePreferredCurrency('test-user-id', 'EUR');

      expect(success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should handle update failure', async () => {
      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: new Error('Update failed') })
      });

      const success = await AbstractAccountService.updatePreferredCurrency('test-user-id', 'GBP');

      expect(success).toBe(false);
    });
  });
});
