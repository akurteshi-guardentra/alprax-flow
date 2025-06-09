
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface CurrencyCardProps {
  currency: string;
  amount: number;
  change?: number;
}

export function CurrencyCard({ currency, amount, change }: CurrencyCardProps) {
  const isPositive = change && change > 0;
  
  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'XLM') {
      return `${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 4 
      })} XLM`;
    }
    return amount.toLocaleString('en-US', { 
      style: 'currency', 
      currency 
    });
  };

  return (
    <Card className={`
      hover:shadow-lg transition-all duration-300 border-none text-white
      ${currency === 'XLM' ? 'bg-gradient-to-br from-blue-800 to-blue-600' : 'bg-gradient-primary'}
    `}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {currency === 'XLM' && (
            <div className="w-6 h-6 rounded-full bg-blue-400/20 flex items-center justify-center">
              <span className="text-xs font-bold">⭐</span>
            </div>
          )}
          {currency}
        </CardTitle>
        {change && (
          <div className={`flex items-center ${isPositive ? "text-emerald-300" : "text-red-300"}`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span className="text-xs ml-1 font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${currency === 'XLM' ? 'text-blue-50' : ''}`}>
          {formatAmount(amount, currency)}
        </div>
      </CardContent>
    </Card>
  );
}
