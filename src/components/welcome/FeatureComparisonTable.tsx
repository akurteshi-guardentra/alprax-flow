
import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeatureTier {
  id: string;
  tier_name: string;
  features: Record<string, boolean>;
}

export function FeatureComparisonTable() {
  const isMobile = useIsMobile();
  
  const { data: tiers } = useQuery({
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

  if (!tiers?.length) return null;

  // Get only the key features (max 5) to display in the simplified table
  const allFeatures = Object.keys(tiers[0].features);
  // Show fewer features on mobile
  const keyFeatures = allFeatures.slice(0, isMobile ? 3 : 5);

  return (
    <div className="max-w-4xl mx-auto mt-4 sm:mt-8 px-2 sm:px-4">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 text-center">Feature Overview</h2>
      
      <div className={`border border-white/10 rounded-lg bg-black/20 backdrop-blur-sm ${isMobile ? 'touch-auto' : ''}`}>
        <ScrollArea className="w-full">
          <div className="min-w-[300px] sm:min-w-[500px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-2 sm:p-3 text-white/60 text-sm sm:text-base">Features</th>
                  {tiers.map((tier) => (
                    <th key={tier.id} className="text-center p-2 sm:p-3 text-white font-medium text-sm sm:text-base">
                      {tier.tier_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keyFeatures.map((feature) => (
                  <tr key={feature} className="border-b border-white/10 last:border-b-0">
                    <td className="p-2 sm:p-3 text-white text-sm sm:text-base">
                      {feature.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    {tiers.map((tier) => (
                      <td key={`${tier.id}-${feature}`} className="text-center p-2 sm:p-3">
                        {tier.features[feature] ? (
                          <Check className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-kosovo-yellow mx-auto`} />
                        ) : (
                          <X className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-white/40 mx-auto`} />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
