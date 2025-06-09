
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StellarService } from '../services/stellarService';

// Mock the stellar-sdk module correctly
vi.mock('stellar-sdk', () => {
  return {
    Horizon: {
      Server: vi.fn().mockImplementation(() => ({
        loadAccount: vi.fn().mockResolvedValue({
          accountId: 'mock-account-id',
          sequenceNumber: '123',
          balances: [{ asset_type: 'native', balance: '100' }]
        }),
        submitTransaction: vi.fn().mockResolvedValue({ id: 'mock-tx-id', successful: true }),
        transactions: vi.fn().mockReturnValue({
          forAccount: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          call: vi.fn().mockResolvedValue({ records: [] })
        }),
        fetchBaseFee: vi.fn().mockResolvedValue(100)
      }))
    },
    Networks: {
      TESTNET: 'Test SDF Network ; September 2015',
      PUBLIC: 'Public Global Stellar Network ; September 2015'
    },
    TransactionBuilder: vi.fn().mockImplementation(() => ({
      addOperation: vi.fn().mockReturnThis(),
      setTimeout: vi.fn().mockReturnThis(),
      build: vi.fn().mockReturnValue({
        sign: vi.fn(),
        toXDR: vi.fn().mockReturnValue('mock-xdr')
      })
    })),
    Keypair: {
      random: vi.fn().mockReturnValue({
        publicKey: vi.fn().mockReturnValue('mock-public-key'),
        secret: vi.fn().mockReturnValue('mock-secret-key')
      }),
      fromSecret: vi.fn().mockReturnValue({
        publicKey: vi.fn().mockReturnValue('mock-public-key')
      })
    },
    Operation: {
      payment: vi.fn().mockReturnValue({})
    },
    Asset: {
      native: vi.fn().mockReturnValue({ type: 'native' })
    }
  };
});

// Mock fetch API
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({ success: true })
});

// Mock toast and hapticFeedback
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@/lib/haptics', () => ({
  hapticFeedback: vi.fn()
}));

describe('StellarService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should create a new Stellar account', async () => {
      const result = await StellarService.createAccount();
      
      expect(result).toHaveProperty('publicKey');
      expect(result).toHaveProperty('secretKey');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAccountDetails', () => {
    it('should fetch account details', async () => {
      const result = await StellarService.getAccountDetails('mock-public-key');
      
      expect(result).toHaveProperty('accountId');
      expect(result).toHaveProperty('balances');
    });
  });

  describe('sendPayment', () => {
    it('should send a payment transaction', async () => {
      const result = await StellarService.sendPayment({
        sourceSecretKey: 'mock-secret-key',
        destinationPublicKey: 'mock-destination-key',
        amount: '10'
      });
      
      expect(result).toHaveProperty('id');
      expect(result.successful).toBe(true);
    });
  });

  describe('encryptDecrypt', () => {
    it('should encrypt and decrypt a secret key', () => {
      const secretKey = 'S12345678901234567890';
      const password = 'testPassword';
      
      const encrypted = StellarService.encryptSecretKey(secretKey, password);
      expect(typeof encrypted).toBe('string');
      
      const decrypted = StellarService.decryptSecretKey(encrypted, password);
      expect(decrypted).toBe(secretKey);
    });
    
    it('should throw an error for invalid password', () => {
      const secretKey = 'S12345678901234567890';
      const encrypted = StellarService.encryptSecretKey(secretKey, 'correctPassword');
      
      expect(() => {
        StellarService.decryptSecretKey(encrypted, 'wrongPassword');
      }).toThrow('Invalid password');
    });
  });
});
