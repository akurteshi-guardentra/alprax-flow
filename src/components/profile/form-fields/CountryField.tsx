
import { Profile } from "@/types/profile";
import { Label } from "@/components/ui/label";
import { CountrySelector } from "@/components/CountrySelector";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useDataSaverMode } from "@/hooks/use-data-saver";
import { useMobile } from "@/hooks/use-mobile";
import { useNetworkAwareLoading } from "@/hooks/use-network-aware-loading";
import { Globe } from "lucide-react";

interface CountryFieldProps {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

export const CountryField = ({ profile, setProfile }: CountryFieldProps) => {
  const { isDataSaverEnabled, isLowEndDevice } = useDataSaverMode();
  const { isMobile } = useMobile();
  const { networkStatus } = useNetworkAwareLoading(false);
  const [countries, setCountries] = useState<{code: string, name: string}[]>([]);
  const [isFilteredList, setIsFilteredList] = useState(false);

  useEffect(() => {
    // In data saver mode or on slow connections, load only popular countries
    // to reduce the data transfer size and improve performance
    const shouldLoadReducedList = 
      isDataSaverEnabled || 
      networkStatus === 'poor' || 
      (isLowEndDevice && isMobile);
    
    setIsFilteredList(shouldLoadReducedList);
  }, [isDataSaverEnabled, isLowEndDevice, isMobile, networkStatus]);
  
  const handleSelect = (countryCode: string) => {
    if (profile) {
      setProfile({ ...profile, country: countryCode });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-white/70" />
          Country
        </Label>
        {isFilteredList && (
          <span className="text-xs text-white/60">Popular countries</span>
        )}
      </div>
      <CountrySelector
        value={profile?.country || undefined}
        onSelect={handleSelect}
        showOnlyPopular={isFilteredList}
        className={cn(
          "bg-white/10 border-white/10 text-white",
          "focus:ring-primary focus:border-primary/50",
          isLowEndDevice ? "h-10" : "h-11"
        )}
      />
    </div>
  );
};
