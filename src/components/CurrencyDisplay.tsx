
import { DollarSign, Euro, PoundSterling, CreditCard } from "lucide-react";

interface CurrencySymbolProps {
  currency: string;
  size?: number;
  className?: string;
}

export function CurrencySymbol({ currency, size = 20, className = "" }: CurrencySymbolProps) {
  switch (currency.toUpperCase()) {
    case "USD":
      return <DollarSign size={size} className={className} />;
    case "EUR":
      return <Euro size={size} className={className} />;
    case "GBP":
      return <PoundSterling size={size} className={className} />;
    case "JPY":
      // Use DollarSign as fallback since Yen is not available in lucide-react
      return <DollarSign size={size} className={`${className}`} />;
    default:
      return <CreditCard size={size} className={className} />;
  }
}

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function CurrencyDisplay({ amount, currency = "USD", className = "" }: CurrencyDisplayProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className={`flex items-center ${className}`}>
      <CurrencySymbol currency={currency} className="mr-1" />
      <span>{formatter.format(amount).replace(/[A-Z]{3}/, '')}</span>
    </div>
  );
}
