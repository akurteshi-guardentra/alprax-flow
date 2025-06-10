
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FiatDisplayProps {
  xlmAmount: string | number;
  currency?: 'USD' | 'EUR' | 'GBP';
  showSymbol?: boolean;
  className?: string;
}

// Mock exchange rates - in production this would come from an API
const EXCHANGE_RATES = {
  USD: 0.12, // 1 XLM = $0.12
  EUR: 0.11, // 1 XLM = €0.11
  GBP: 0.09, // 1 XLM = £0.09
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function FiatDisplay({ 
  xlmAmount, 
  currency = 'USD', 
  showSymbol = true,
  className = '' 
}: FiatDisplayProps) {
  const [fiatAmount, setFiatAmount] = useState<string>('0.00');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateFiatAmount = () => {
      const xlm = typeof xlmAmount === 'string' ? parseFloat(xlmAmount) : xlmAmount;
      const rate = EXCHANGE_RATES[currency];
      const fiat = xlm * rate;
      
      // Format to 2 decimal places
      setFiatAmount(fiat.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }));
      setIsLoading(false);
    };

    if (xlmAmount !== undefined && xlmAmount !== null) {
      calculateFiatAmount();
    }
  }, [xlmAmount, currency]);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-white/10 rounded w-20"></div>
      </div>
    );
  }

  return (
    <motion.span 
      className={`font-medium ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {showSymbol && CURRENCY_SYMBOLS[currency]}{fiatAmount}
      {!showSymbol && ` ${currency}`}
    </motion.span>
  );
}

// Helper hook for currency conversion
export function useFiatConversion(xlmAmount: string | number, currency: 'USD' | 'EUR' | 'GBP' = 'USD') {
  const [fiatAmount, setFiatAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const xlm = typeof xlmAmount === 'string' ? parseFloat(xlmAmount) : xlmAmount;
    const rate = EXCHANGE_RATES[currency];
    const fiat = xlm * rate;
    
    setFiatAmount(fiat);
    setIsLoading(false);
  }, [xlmAmount, currency]);

  return { fiatAmount, isLoading, rate: EXCHANGE_RATES[currency] };
}
