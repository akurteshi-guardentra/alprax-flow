import { describe, it, expect, beforeEach } from 'vitest';
import { transactionCache } from '../utils/transaction-cache';
import { SecureStorage } from '../utils/storage-utils';

describe('Performance Utils', () => {
  beforeEach(() => {
    transactionCache.clearAllCaches();
    SecureStorage.clear();
  });

  describe('TransactionCache', () => {
    it('should store and retrieve data', () => {
      const testData = [{ id: '123', amount: 100 }];
      transactionCache.storeTransactions('test-key', testData);
      
      const result = transactionCache.getTransactions('test-key');
      expect(result.data).toEqual(testData);
    });

    it('should respect TTL', async () => {
      const testData = [{ id: '123', amount: 100 }];
      transactionCache.storeTransactions('test-key', testData, { maxAge: 100 }); // 100ms TTL
      
      const result1 = transactionCache.getTransactions('test-key');
      expect(result1.data).toEqual(testData);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      const result2 = transactionCache.getTransactions('test-key');
      expect(result2.isFresh).toBe(false);
    });

    it('should clear specific cache', () => {
      transactionCache.storeTransactions('user-123-tx', [{ amount: 100 }]);
      transactionCache.storeTransactions('user-456-tx', [{ amount: 200 }]);
      
      transactionCache.clearCache('user-123-tx');
      
      const result1 = transactionCache.getTransactions('user-123-tx');
      const result2 = transactionCache.getTransactions('user-456-tx');
      
      expect(result1.data).toBeNull();
      expect(result2.data).toBeTruthy();
    });
  });

  describe('SecureStorage', () => {
    it('should store and retrieve data with prefix', () => {
      const testData = { value: 'test' };
      SecureStorage.setItem('test-key', testData);
      
      const retrieved = SecureStorage.getItem('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should handle JSON serialization errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('Storage full');
      };
      
      expect(() => {
        SecureStorage.setItem('test', { data: 'test' });
      }).not.toThrow();
      
      // Restore original method
      Storage.prototype.setItem = originalSetItem;
    });
  });
});