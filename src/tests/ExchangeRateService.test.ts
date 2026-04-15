import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exchangeRateService } from '../services/ExchangeRateService';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}));

describe('ExchangeRateService', () => {
  beforeEach(() => {
    exchangeRateService.clearCache();
    vi.clearAllMocks();
  });

  describe('getExchangeRate', () => {
    it('should return the USD → EUR rate', async () => {
      const rate = await exchangeRateService.getExchangeRate('USD', 'EUR');
      expect(rate).toBe(0.85);
    });

    it('should return the USD → GBP rate', async () => {
      const rate = await exchangeRateService.getExchangeRate('USD', 'GBP');
      expect(rate).toBe(0.73);
    });

    it('should return the USD → XLM rate', async () => {
      const rate = await exchangeRateService.getExchangeRate('USD', 'XLM');
      expect(rate).toBe(0.12);
    });

    it('should return the EUR → USD rate', async () => {
      const rate = await exchangeRateService.getExchangeRate('EUR', 'USD');
      expect(rate).toBe(1.18);
    });

    it('should return the XLM → USD rate', async () => {
      const rate = await exchangeRateService.getExchangeRate('XLM', 'USD');
      expect(rate).toBe(8.33);
    });

    it('should return 1 for an unknown currency pair', async () => {
      const rate = await exchangeRateService.getExchangeRate('USD', 'UNKNOWN');
      expect(rate).toBe(1);
    });

    it('should return 1 for a completely unknown base currency', async () => {
      const rate = await exchangeRateService.getExchangeRate('UNKNOWN', 'EUR');
      expect(rate).toBe(1);
    });

    it('should cache the result so the cache size grows', async () => {
      expect(exchangeRateService.getCacheSize()).toBe(0);
      await exchangeRateService.getExchangeRate('USD', 'EUR');
      expect(exchangeRateService.getCacheSize()).toBe(1);
    });

    it('should return the cached value on a second call', async () => {
      const rate1 = await exchangeRateService.getExchangeRate('USD', 'EUR');
      const rate2 = await exchangeRateService.getExchangeRate('USD', 'EUR');
      expect(rate1).toBe(rate2);
      // Cache should not have grown beyond one entry for the same pair
      expect(exchangeRateService.getCacheSize()).toBe(1);
    });
  });

  describe('getMultipleRates', () => {
    it('should return rates for multiple currencies at once', async () => {
      const rates = await exchangeRateService.getMultipleRates('USD', [
        'EUR',
        'GBP',
        'XLM'
      ]);

      expect(rates['EUR']).toBe(0.85);
      expect(rates['GBP']).toBe(0.73);
      expect(rates['XLM']).toBe(0.12);
    });

    it('should return 1 for unknown targets', async () => {
      const rates = await exchangeRateService.getMultipleRates('USD', ['UNKNOWN']);
      expect(rates['UNKNOWN']).toBe(1);
    });

    it('should return an empty object for an empty target array', async () => {
      const rates = await exchangeRateService.getMultipleRates('USD', []);
      expect(rates).toEqual({});
    });

    it('should populate the cache for each requested pair', async () => {
      await exchangeRateService.getMultipleRates('USD', ['EUR', 'GBP']);
      expect(exchangeRateService.getCacheSize()).toBe(2);
    });
  });

  describe('cache management', () => {
    it('should report cache size correctly as entries are added', async () => {
      expect(exchangeRateService.getCacheSize()).toBe(0);

      await exchangeRateService.getExchangeRate('USD', 'EUR');
      expect(exchangeRateService.getCacheSize()).toBe(1);

      await exchangeRateService.getExchangeRate('EUR', 'USD');
      expect(exchangeRateService.getCacheSize()).toBe(2);
    });

    it('should reset cache size to 0 after clearCache', async () => {
      await exchangeRateService.getExchangeRate('USD', 'EUR');
      await exchangeRateService.getExchangeRate('EUR', 'GBP');

      expect(exchangeRateService.getCacheSize()).toBeGreaterThan(0);

      exchangeRateService.clearCache();

      expect(exchangeRateService.getCacheSize()).toBe(0);
    });

    it('should re-fetch after cache is cleared', async () => {
      const rate1 = await exchangeRateService.getExchangeRate('USD', 'EUR');
      exchangeRateService.clearCache();
      const rate2 = await exchangeRateService.getExchangeRate('USD', 'EUR');
      // Values should be identical (same mock data)
      expect(rate1).toBe(rate2);
      // But cache should have been repopulated
      expect(exchangeRateService.getCacheSize()).toBe(1);
    });
  });
});
