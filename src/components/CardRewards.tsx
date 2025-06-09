
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Crown, Diamond, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";

export function CardRewards() {
  const { toast } = useToast();

  const handleUpgrade = (tier: string) => {
    toast({
      title: "Coming Soon",
      description: `${tier} upgrade will be available soon!`,
    });
  };

  const tiers = [
    {
      title: "Diamond",
      description: "10% crypto cashback on all transfers",
      icon: Diamond,
      features: [
        "Unlimited transfers",
        "Priority support 24/7",
        "Exclusive market insights",
        "Best exchange rates"
      ],
      price: "€49.99/month",
      highlight: true,
    },
    {
      title: "Platinum",
      description: "7% crypto cashback up to €50,000/month",
      icon: Crown,
      features: [
        "€50,000 monthly limit",
        "24/7 support",
        "Premium analytics",
        "Preferred exchange rates"
      ],
      price: "€29.99/month",
      highlight: false,
    },
    {
      title: "Gold",
      description: "5% crypto cashback up to €25,000/month",
      icon: Star,
      features: [
        "€25,000 monthly limit",
        "Priority support",
        "Market alerts",
        "Enhanced security"
      ],
      price: "€19.99/month",
      highlight: false,
    },
    {
      title: "Basic",
      description: "2% crypto cashback up to €10,000/month",
      icon: Shield,
      features: [
        "€10,000 monthly limit",
        "Standard support",
        "Basic analytics",
        "Secure transfers"
      ],
      price: "Free",
      highlight: false,
    }
  ];

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-blue-900/90 to-indigo-900/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Diamond className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
          Premium Rewards Program
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex"
            >
              <Card className={`h-full w-full border-none ${
                tier.highlight 
                  ? 'bg-gradient-to-br from-yellow-500/80 to-amber-600/80 shadow-yellow-500/20 shadow-lg' 
                  : 'bg-white/20'
              }`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <tier.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${tier.highlight ? 'text-yellow-200' : 'text-white'}`} />
                    {tier.highlight && (
                      <div className="flex -space-x-1">
                        <Star className="h-4 w-4 text-yellow-200" />
                        <Star className="h-4 w-4 text-yellow-200" />
                        <Star className="h-4 w-4 text-yellow-200" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">{tier.title}</h3>
                  <p className="text-sm text-white/90 mb-4">{tier.description}</p>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="text-sm flex items-center gap-2 text-white">
                        <span className="text-emerald-300">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="text-base sm:text-lg font-semibold mb-4 text-yellow-200">{tier.price}</div>
                  <Button 
                    onClick={() => handleUpgrade(tier.title)}
                    className={`w-full ${
                      tier.highlight 
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold shadow-lg' 
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
