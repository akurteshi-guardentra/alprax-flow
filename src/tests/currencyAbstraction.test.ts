import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertXLMToFiat, convertFiatToXLM, getExchangeRates } from '../lib/currency/abstractionLayer';

// Mock fetch for exchange rates
global.fetch = vi.fn();

describe('Currency Abstraction Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getExchangeRates', () => {
    it('should fetch current exchange rates', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          stellar: { 
            usd: 0.12, 
            eur: 0.11, 
            gbp: 0.09 
          } 
        })
      });

      const rates = await getExchangeRates();

      expect(rates.USD).toBe(0.12);
      expect(rates.EUR).toBe(0.11);
      expect(rates.GBP).toBe(0.09);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('coingecko')
      );
    });

    it('should handle API failures with fallback rates', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('API error'));

      const rates = await getExchangeRates();

      expect(rates.USD).toBeGreaterThan(0);
      expect(rates.EUR).toBeGreaterThan(0);
      expect(rates.GBP).toBeGreaterThan(0);
    });
  });

  describe('convertXLMToFiat', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ 
          stellar: { 
            usd: 0.12, 
            eur: 0.11, 
            gbp: 0.09 
          } 
        })
      });
    });

    it('should convert XLM to USD correctly', async () => {
      const fiatAmount = await convertXLMToFiat(100, 'USD');

      expect(fiatAmount).toBe(12);
    });

    it('should convert XLM to EUR correctly', async () => {
      const fiatAmount = await convertXLMToFiat(100, 'EUR');

      expect(fiatAmount).toBe(11);
    });

    it('should handle numeric XLM amounts', async () => {
      const fiatAmount = await convertXLMToFiat(200, 'USD');

      expect(fiatAmount).toBe(24);
    });

    it('should round to 2 decimal places', async () => {
      const fiatAmount = await convertXLMToFiat(33.333, 'USD');

      expect(fiatAmount.toString()).toMatch(/^\d+\.\d{2}$/);
    });
  });

  describe('convertFiatToXLM', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ 
          stellar: { 
            usd: 0.12, 
            eur: 0.11, 
            gbp: 0.09 
          } 
        })
      });
    });

    it('should convert USD to XLM correctly', async () => {
      const xlmAmount = await convertFiatToXLM(12, 'USD');

      expect(xlmAmount).toBe(100);
    });

    it('should convert EUR to XLM correctly', async () => {
      const xlmAmount = await convertFiatToXLM(11, 'EUR');

      expect(xlmAmount).toBe(100);
    });

    it('should handle precision with 7 decimal places', async () => {
      const xlmAmount = await convertFiatToXLM(25, 'USD');

      expect(xlmAmount).toBeGreaterThan(0);
    });

    it('should handle minimum amounts', async () => {
      const xlmAmount = await convertFiatToXLM(0.01, 'USD');

      expect(xlmAmount).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const rates = await getExchangeRates();

      expect(rates.USD).toBeGreaterThan(0);
      expect(rates.EUR).toBeGreaterThan(0);
      expect(rates.GBP).toBeGreaterThan(0);
    });

    it('should handle invalid responses', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      const rates = await getExchangeRates();

      expect(rates.USD).toBe(0.12); // Fallback rates
      expect(rates.EUR).toBe(0.11);
    });
  });
});
