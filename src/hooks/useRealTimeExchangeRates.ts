
import { useState, useEffect } from 'react';

interface ExchangeRates {
  EUR: number;
  USD: number;
  GBP: number;
}

export function useRealTimeExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates>({ EUR: 0, USD: 0, GBP: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=eur,usd,gbp'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      
      setRates({
        EUR: data.stellar?.eur || 0,
        USD: data.stellar?.usd || 0,
        GBP: data.stellar?.gbp || 0
      });
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback rates
      setRates({ EUR: 0.12, USD: 0.13, GBP: 0.10 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { rates, isLoading, error, refetchRates: fetchRates };
}
