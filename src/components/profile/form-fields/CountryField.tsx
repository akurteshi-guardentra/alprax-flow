
import { Label } from "@/components/ui/label";
import { CountrySelector } from "@/components/ui/country-selector";
import { Profile } from "@/types/profile";
import { motion } from "framer-motion";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { useNetworkAwareLoading } from "@/hooks/use-network-aware-loading";
import { useDataSaverMode } from "@/hooks/use-data-saver";

interface CountryFieldProps {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

export const CountryField = ({ profile, setProfile }: CountryFieldProps) => {
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { isDataSaverEnabled, isLowEndDevice } = useDataSaverMode();
  const { networkStatus } = useNetworkAwareLoading();

  const handleCountryChange = (countryCode: string) => {
    if (profile) {
      setProfile({
        ...profile,
        country: countryCode
      });
    }
  };

  return (
    <motion.div 
      className="space-y-2"
      initial={shouldAnimate ? { opacity: 0, x: -10 } : undefined}
      animate={{ opacity: 1, x: 0 }}
      transition={getTransition({ duration: 0.3, delay: 0.2 })}
    >
      <Label htmlFor="country" className="text-white">
        Country
      </Label>
      <div className="relative">
        <CountrySelector
          value={profile?.country || ""}
          onSelect={handleCountryChange}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
      
      {isDataSaverEnabled && (
        <div className="text-xs text-white/50 mt-1">
          Data saver mode: Country list optimized
        </div>
      )}
      
      {networkStatus === 'poor' && (
        <div className="text-xs text-yellow-400 mt-1">
          Slow connection detected
        </div>
      )}
    </motion.div>
  );
};
