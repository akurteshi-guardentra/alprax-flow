import { toast } from 'sonner';

export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  timestamp: Date;
  source: string;
}

export interface ExchangeRateResponse {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
}

class ExchangeRateService {
  private cache = new Map<string, { rate: ExchangeRate; expiry: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getExchangeRate(from: string, to: string): Promise<number> {
    const cacheKey = `${from}-${to}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiry) {
      return cached.rate.rate;
    }

    try {
      // Using a free exchange rate API (fallback to mock data for demo)
      const response = await this.fetchExchangeRates(from);
      const rate = response.rates[to] || 1;
      
      const exchangeRate: ExchangeRate = {
        baseCurrency: from,
        targetCurrency: to,
        rate,
        timestamp: new Date(),
        source: 'exchangerate-api'
      };

      this.cache.set(cacheKey, {
        rate: exchangeRate,
        expiry: Date.now() + this.CACHE_DURATION
      });

      return rate;
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      
      // Fallback to cached rate if available
      if (cached) {
        toast.warning('Using cached exchange rate due to API error');
        return cached.rate.rate;
      }
      
      // Ultimate fallback
      toast.error('Exchange rate unavailable, using 1:1 ratio');
      return 1;
    }
  }

  private async fetchExchangeRates(baseCurrency: string): Promise<ExchangeRateResponse> {
    // Mock implementation for demo - replace with actual API
    const mockRates: Record<string, Record<string, number>> = {
      'USD': { 'EUR': 0.85, 'GBP': 0.73, 'XLM': 0.12, 'BTC': 0.000023 },
      'EUR': { 'USD': 1.18, 'GBP': 0.86, 'XLM': 0.14, 'BTC': 0.000027 },
      'XLM': { 'USD': 8.33, 'EUR': 7.14, 'GBP': 6.10, 'BTC': 0.00019 }
    };

    return {
      rates: mockRates[baseCurrency] || { [baseCurrency]: 1 },
      base: baseCurrency,
      timestamp: Date.now()
    };
  }

  async getMultipleRates(baseCurrency: string, targetCurrencies: string[]): Promise<Record<string, number>> {
    const rates: Record<string, number> = {};
    
    await Promise.all(
      targetCurrencies.map(async (target) => {
        try {
          rates[target] = await this.getExchangeRate(baseCurrency, target);
        } catch (error) {
          console.error(`Failed to get rate for ${baseCurrency}-${target}:`, error);
          rates[target] = 1;
        }
      })
    );

    return rates;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const exchangeRateService = new ExchangeRateService();