
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Zap, Repeat, Wallet } from "lucide-react";

export function CryptoEcosystem() {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: "Coming Soon",
      description: `${action} feature will be available soon!`,
    });
  };
  const features = [
    {
      title: "Lightning Transfer",
      description: "Send money instantly with near-zero fees",
      icon: Zap,
      apy: null,
      onClick: () => handleAction("Lightning Transfer"),
      className: "bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900",
    },
    {
      title: "High Yield Savings",
      description: "Earn up to 8% APY on your savings",
      icon: Repeat,
      apy: "8%",
      onClick: () => handleAction("High Yield Savings"),
      className: "bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900",
    },
    {
      title: "Crypto Swap",
      description: "Convert between cryptocurrencies instantly",
      icon: Wallet,
      apy: null,
      onClick: () => handleAction("Crypto Swap"),
      className: "bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900",
    },
  ];

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Crypto Ecosystem</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card 
            key={feature.title} 
            className={`border-none transition-all duration-300 hover:scale-105 ${feature.className}`}
          >
            <CardContent className="p-4 sm:p-6 text-white">
              <div className="mb-4">
                <feature.icon className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm opacity-90 mb-4">{feature.description}</p>
              {feature.apy && (
                <div className="bg-white/20 rounded-full px-3 py-1 text-sm inline-block mb-4">
                  APY: {feature.apy}
                </div>
              )}
              <Button 
                onClick={feature.onClick}
                className="w-full bg-white/10 hover:bg-white/20 border-none text-sm sm:text-base"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
