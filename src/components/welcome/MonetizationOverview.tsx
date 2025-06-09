
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Diamond, Gift, Wallet, CreditCard, Repeat, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function MonetizationOverview() {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: "Coming Soon",
      description: `${action} feature will be available soon!`,
    });
  };

  const revenueStreams = [
    {
      title: "Premium Subscriptions",
      description: "Tiered membership plans with exclusive benefits",
      icon: Diamond,
      features: ["Up to 10% cashback", "Priority support", "Preferred rates"],
      action: "View Plans",
      className: "bg-gradient-to-br from-yellow-500/80 to-amber-600/80",
      onClick: () => handleAction("Premium Plans"),
    },
    {
      title: "Crypto Services",
      description: "DeFi staking, swaps and transfers",
      icon: Wallet,
      features: ["8% APY on staking", "Near-zero fees", "Instant transfers"],
      action: "Explore Crypto",
      className: "bg-gradient-to-br from-blue-600/80 to-blue-800/80",
      onClick: () => handleAction("Crypto Services"),
    },
    {
      title: "Referral System",
      description: "Earn rewards for growing our community",
      icon: Gift,
      features: ["€10 per qualified referral", "Tiered bonuses", "Partner program"],
      action: "Start Referring",
      className: "bg-gradient-to-br from-purple-600/80 to-purple-800/80",
      onClick: () => handleAction("Referral Program"),
    }
  ];

  const additionalServices = [
    {
      title: "Transaction Fees",
      description: "Tiered fees based on volume",
      icon: Repeat,
      onClick: () => handleAction("Transaction Fees"),
    },
    {
      title: "Card Issuance",
      description: "Physical & virtual cards",
      icon: CreditCard,
      onClick: () => handleAction("Card Services"),
    },
    {
      title: "Exchange Services",
      description: "Competitive forex rates",
      icon: Zap,
      onClick: () => handleAction("Exchange Services"),
    }
  ];

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-blue-900/90 to-indigo-900/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Diamond className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
          Revenue Streams
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Primary Revenue Streams */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revenueStreams.map((stream, index) => (
              <motion.div
                key={stream.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex"
              >
                <Card className={`h-full w-full border-none ${stream.className}`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="mb-4">
                      <stream.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">{stream.title}</h3>
                    <p className="text-sm text-white/90 mb-4">{stream.description}</p>
                    <ul className="space-y-2 mb-6">
                      {stream.features.map((feature) => (
                        <li key={feature} className="text-sm flex items-center gap-2 text-white">
                          <span className="text-emerald-300">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={stream.onClick}
                      className="w-full bg-white/20 hover:bg-white/30 text-white"
                    >
                      {stream.action}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Additional Revenue Streams */}
          <div className="grid grid-cols-3 gap-3">
            {additionalServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="cursor-pointer"
                onClick={service.onClick}
              >
                <div className="bg-white/10 hover:bg-white/15 p-3 rounded-lg flex flex-col items-center text-center transition-colors">
                  <service.icon className="h-5 w-5 mb-2 text-white" />
                  <h4 className="text-sm font-medium text-white">{service.title}</h4>
                  <p className="text-xs text-white/70">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Investor Appeal */}
          <div className="bg-gradient-to-r from-black/20 to-black/10 p-4 rounded-lg mt-4">
            <h4 className="text-white text-sm font-medium mb-2">Investor Metrics</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-yellow-400 text-lg font-bold">86%</p>
                <p className="text-xs text-white/70">User Retention</p>
              </div>
              <div className="text-center">
                <p className="text-yellow-400 text-lg font-bold">€24</p>
                <p className="text-xs text-white/70">Avg. Revenue/User</p>
              </div>
              <div className="text-center">
                <p className="text-yellow-400 text-lg font-bold">24%</p>
                <p className="text-xs text-white/70">QoQ Growth</p>
              </div>
              <div className="text-center">
                <p className="text-yellow-400 text-lg font-bold">€1.2M</p>
                <p className="text-xs text-white/70">Monthly Volume</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
