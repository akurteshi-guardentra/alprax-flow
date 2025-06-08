
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface CryptoPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

export function RealTimePrices() {
  const { data: cryptoPrices, isLoading } = useQuery({
    queryKey: ['crypto-prices'],
    queryFn: async () => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=4&page=1&sparkline=false'
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json() as Promise<CryptoPrice[]>;
    },
    refetchInterval: 60000 // Refetch every minute
  });

  const prices = cryptoPrices || [
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", current_price: 52341.23, price_change_percentage_24h: 2.5, image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", current_price: 2853.12, price_change_percentage_24h: -1.2, image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
    { id: "alprax", name: "Alprax", symbol: "APX", current_price: 0.1235, price_change_percentage_24h: 5.8, image: "https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png" },
    { id: "ripple", name: "Ripple", symbol: "XRP", current_price: 0.5423, price_change_percentage_24h: 3.2, image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
  ];

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <LineChart className="h-6 w-6 text-indigo-400" />
          Real-Time Market Prices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prices.map((crypto, index) => (
            <motion.div
              key={crypto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img 
                    src={crypto.image} 
                    alt={crypto.name} 
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{crypto.name}</h3>
                    <p className="text-sm text-slate-300">{crypto.symbol.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    ${crypto.current_price.toLocaleString()}
                  </p>
                  <p className={`text-sm font-medium flex items-center justify-end gap-1 
                    ${crypto.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
