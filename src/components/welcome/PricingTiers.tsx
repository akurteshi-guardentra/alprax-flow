
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, Loader2, Rocket, Trophy, Target, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PricingFAQ } from "./PricingFAQ";
import { FeatureComparisonTable } from "./FeatureComparisonTable";
import { CustomerTestimonials } from "./CustomerTestimonials";
import { useTransferImpact } from "@/hooks/useTransferImpact";

interface FeatureTier {
  id: string;
  tier_name: string;
  monthly_price: number;
  features: Record<string, boolean>;
}

export function PricingTiers() {
  const { data: tiers, isLoading } = useQuery({
    queryKey: ['feature-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_tiers')
        .select('*')
        .order('monthly_price');
      
      if (error) throw error;
      return data as FeatureTier[];
    }
  });

  const { stats } = useTransferImpact();

  const handleUpgrade = (tierName: string) => {
    toast.info(`Upgrade to ${tierName} coming soon!`);
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'diamond':
        return <Crown className="h-8 w-8 text-indigo-400" />;
      case 'platinum':
        return <Crown className="h-8 w-8 text-purple-400" />;
      case 'gold':
        return <Target className="h-8 w-8 text-amber-400" />;
      case 'business':
        return <Rocket className="h-8 w-8 text-kosovo-yellow" />;
      default:
        return <Sparkles className="h-8 w-8 text-blue-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 container mx-auto px-4 flex flex-col items-center min-h-[40vh]">
      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-12"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
        >
          <h3 className="text-lg font-medium text-white/80 mb-2">Total Fees Saved</h3>
          <p className="text-3xl font-bold text-kosovo-yellow">
            ${stats.totalFeeSaved.toFixed(2)}
          </p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
        >
          <h3 className="text-lg font-medium text-white/80 mb-2">Time Saved</h3>
          <p className="text-3xl font-bold text-kosovo-yellow">
            {Math.round(stats.totalTimeSaved / 60)}h
          </p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
        >
          <h3 className="text-lg font-medium text-white/80 mb-2">Carbon Footprint</h3>
          <p className="text-3xl font-bold text-kosovo-yellow">
            -{stats.totalCarbonSaved.toFixed(1)}kg
          </p>
        </motion.div>
      </motion.div>

      <div className="text-center max-w-2xl">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Choose Your Plan
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/70"
        >
          Start with our free tier and upgrade as you grow
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full place-items-center">
        {tiers?.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            className="flex w-full max-w-md"
          >
            <Card className={`relative overflow-hidden border-none w-full ${
              tier.tier_name === "Business" 
                ? 'bg-gradient-to-br from-yellow-500/30 to-amber-600/30' 
                : 'bg-white/10'
              } backdrop-blur-sm hover:bg-white/[0.15] transition-all duration-300`}>
              {tier.tier_name === "Business" && (
                <div className="absolute top-0 right-0 bg-kosovo-yellow text-black text-sm font-bold px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-2 text-left">
                  {getTierIcon(tier.tier_name)}
                  <CardTitle className="text-xl text-white">
                    {tier.tier_name}
                  </CardTitle>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">${tier.monthly_price}</span>
                  <span className="text-white/70 ml-2">/month</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {Object.entries(tier.features).map(([feature, included]) => (
                    included && (
                      <motion.li 
                        key={feature} 
                        className="flex items-center text-white"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Check className="h-5 w-5 text-kosovo-yellow mr-2 flex-shrink-0" />
                        <span className="text-sm font-semibold">{feature.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </motion.li>
                    )
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    tier.tier_name === "Business"
                      ? 'bg-kosovo-yellow hover:bg-kosovo-yellow/90 text-black font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  } transition-colors duration-300`}
                  onClick={() => handleUpgrade(tier.tier_name)}
                >
                  {tier.tier_name === "Basic" ? "Get Started" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Customer Testimonials */}
      <CustomerTestimonials />

      {/* Feature Comparison Table */}
      <FeatureComparisonTable />

      {/* FAQ Section */}
      <PricingFAQ />
    </div>
  );
}
