import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp, DollarSign, Euro } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const cryptoData = {  APX: {
    icon: "https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png",
    name: "Alprax",
    symbol: "APX"
  },
  BTC: {
    icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    name: "Bitcoin",
    symbol: "BTC"
  },
  ETH: {
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    name: "Ethereum",
    symbol: "ETH"
  }
};

const fiatData = {
  USD: {
    name: "US Dollar",
    flag: "🇺🇸",
    symbol: "$",
    icon: DollarSign
  },
  EUR: {
    name: "Euro",
    flag: "🇪🇺",
    symbol: "€",
    icon: Euro
  }
};

export function ExchangeForm() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("XLM");
  const [toCurrency, setToCurrency] = useState("USD");

  const { mutate: executeExchange, isPending } = useMutation({
    mutationFn: async (variables: { 
      fromCurrency: string; 
      toCurrency: string; 
      amount: number 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('exchanges')
        .insert({
          from_currency: variables.fromCurrency,
          to_currency: variables.toCurrency,
          amount: variables.amount,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Exchange initiated successfully");
      setAmount("");
    },
    onError: (error) => {
      toast.error("Failed to initiate exchange");
      console.error("Exchange error:", error);
    }
  });

  const handleExchange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    executeExchange({
      fromCurrency,
      toCurrency,
      amount: Number(amount)
    });
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <ArrowDownUp className="h-6 w-6 text-white" />
          Exchange
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleExchange} className="space-y-4">
          <div className="grid gap-4">
            <div className="relative">
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white pl-10">
                  <img 
                    src={cryptoData[fromCurrency as keyof typeof cryptoData].icon} 
                    alt={fromCurrency}
                    className="w-5 h-5 absolute left-3 top-2.5"
                  />
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span>{cryptoData[fromCurrency as keyof typeof cryptoData].name} ({fromCurrency})</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(cryptoData).map(([symbol, data]) => (
                    <SelectItem 
                      key={symbol} 
                      value={symbol} 
                      className="flex items-center gap-2 text-white hover:bg-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <img src={data.icon} alt={symbol} className="w-5 h-5" />
                        <span>{data.name} ({symbol})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <div className="bg-slate-700/50 p-2 rounded-full">
                <ArrowDownUp className="text-white/60" />
              </div>
            </div>

            <div className="relative">
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white pl-10">
                  <div className="absolute left-3 top-2.5 flex items-center gap-2">
                    {React.createElement(fiatData[toCurrency as keyof typeof fiatData].icon, { 
                      className: "h-5 w-5" 
                    })}
                  </div>
                  <SelectValue>
                    <span>{toCurrency}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(fiatData).map(([currency, data]) => (
                    <SelectItem 
                      key={currency} 
                      value={currency} 
                      className="flex items-center gap-2 text-white hover:bg-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        {React.createElement(data.icon, { className: "h-5 w-5" })}
                        <span>{currency}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />

            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isPending ? "Processing..." : "Exchange"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
