
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, CreditCard, Brain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const cryptoOptions = [
  { 
    value: "XLM", 
    label: "Alprax",
    symbol: "XLM",
    icon: "https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png"
  },
  { 
    value: "BTC", 
    label: "Bitcoin",
    symbol: "BTC",
    icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png"
  },
  { 
    value: "ETH", 
    label: "Ethereum",
    symbol: "ETH",
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png"
  },
  { 
    value: "SOL", 
    label: "Solana",
    symbol: "SOL",
    icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png"
  },
  { 
    value: "ADA", 
    label: "Cardano",
    symbol: "ADA",
    icon: "https://assets.coingecko.com/coins/images/975/small/cardano.png"
  }
];

const balkanCountries = [
  { value: "albania", label: "Albania", flag: "🇦🇱" },
  { value: "bosnia", label: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { value: "bulgaria", label: "Bulgaria", flag: "🇧🇬" },
  { value: "croatia", label: "Croatia", flag: "🇭🇷" },
  { value: "greece", label: "Greece", flag: "🇬🇷" },
  { value: "kosovo", label: "Kosovo", flag: "🇽🇰" },
  { value: "montenegro", label: "Montenegro", flag: "🇲🇪" },
  { value: "northMacedonia", label: "North Macedonia", flag: "🇲🇰" },
  { value: "romania", label: "Romania", flag: "🇷🇴" },
  { value: "serbia", label: "Serbia", flag: "🇷🇸" },
  { value: "slovenia", label: "Slovenia", flag: "🇸🇮" }
];

export function QuickActions() {
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState("XLM");
  const [selectedCountry, setSelectedCountry] = useState("");

  const handleAction = (action: string) => {
    let message = "";
    if (action === "Send Money" && selectedCountry) {
      message = `Send Money to ${balkanCountries.find(c => c.value === selectedCountry)?.label} feature will be available soon!`;
    } else if (action === "Buy Crypto" && selectedCrypto) {
      message = `Buy ${selectedCrypto} feature will be available soon!`;
    } else {
      message = `${action} feature will be available soon!`;
    }

    toast({
      title: "Coming Soon",
      description: message,
    });
  };

  const actions = [
    {
      title: "Send Money",
      icon: Send,
      onClick: () => handleAction("Send Money"),
      className: "bg-secondary hover:bg-secondary/90",
      selector: (
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-full mb-2 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select country destination">
              {selectedCountry && (
                <div className="flex items-center gap-2">
                  <span>{balkanCountries.find(c => c.value === selectedCountry)?.flag}</span>
                  <span>{balkanCountries.find(c => c.value === selectedCountry)?.label}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {balkanCountries.map((country) => (
              <SelectItem 
                key={country.value} 
                value={country.value}
                className="flex items-center gap-2 text-white hover:bg-slate-700"
              >
                <div className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      title: "Buy Crypto",
      icon: CreditCard,
      onClick: () => handleAction("Buy Crypto"),
      className: "bg-primary hover:bg-primary/90",
      selector: (
        <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
          <SelectTrigger className="w-full mb-2 bg-white/10 border-white/20 text-white">
            <SelectValue>
              {selectedCrypto && (
                <div className="flex items-center gap-2">
                  <img 
                    src={cryptoOptions.find(c => c.value === selectedCrypto)?.icon} 
                    alt={selectedCrypto}
                    className="w-4 h-4"
                  />
                  <span>{cryptoOptions.find(c => c.value === selectedCrypto)?.label} ({selectedCrypto})</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {cryptoOptions.map((crypto) => (
              <SelectItem 
                key={crypto.value} 
                value={crypto.value}
                className="flex items-center gap-2 text-white hover:bg-slate-700"
              >
                <div className="flex items-center gap-2">
                  <img src={crypto.icon} alt={crypto.value} className="w-4 h-4" />
                  <span>{crypto.label} ({crypto.symbol})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      title: "AI Insights",
      icon: Brain,
      onClick: () => handleAction("AI Insights"),
      className: "bg-accent hover:bg-accent/90",
    },
  ];

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {actions.map((action) => (
          <div key={action.title} className="space-y-2">
            {action.selector}
            <Button
              onClick={action.onClick}
              className={`w-full justify-start gap-2 text-white ${action.className}`}
            >
              <action.icon className="h-4 w-4" />
              {action.title}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
