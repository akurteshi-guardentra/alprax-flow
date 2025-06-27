
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { countries, Country } from "@/lib/countries";

interface CountrySelectorProps {
  value?: string;
  onSelect: (value: string) => void;
  className?: string;
}

export function CountrySelector({ value, onSelect, className }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    countries.find((country) => country.value === value)
  );

  useEffect(() => {
    const country = countries.find((country) => country.value === value);
    if (country) {
      setSelectedCountry(country);
    } else {
      setSelectedCountry(undefined);
    }
  }, [value]);

  // State for search input
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    
    const query = searchQuery.toLowerCase();
    return countries.filter(country => 
      country.label.toLowerCase().includes(query) || 
      country.value.toLowerCase().includes(query)
    );
  }, [searchQuery]);
  
  // Handle keyboard navigation and search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && open && selectedCountry) {
      onSelect(selectedCountry.value);
      setOpen(false);
    }
  };
  
  // Handle direct selection of a country
  const handleSelectCountry = (countryValue: string) => {
    console.log('Country selected:', countryValue);
    const country = countries.find(c => c.value === countryValue);
    if (country) {
      setSelectedCountry(country);
      onSelect(countryValue);
      setOpen(false);
      setSearchQuery(""); // Clear search on selection
    }
  };

  // Log debug information
  useEffect(() => {
    console.log('CountrySelector Debug:', {
      open,
      selectedCountry,
      value,
      filteredCountriesCount: filteredCountries.length
    });
  }, [open, selectedCountry, value, filteredCountries.length]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full justify-between transition-all duration-200",
            "bg-white/10 border-white/20 text-white",
            "hover:bg-white/20 hover:border-white/30",
            "focus:ring-2 focus:ring-white/20 focus:border-white/40",
            selectedCountry ? "font-medium" : "text-white/70",
            className
          )}
        >
          {selectedCountry ? (
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedCountry.value}
            >
              <span className="mr-2 text-lg">{selectedCountry.flag}</span>
              <span>{selectedCountry.label}</span>
            </motion.div>
          ) : (
            <div className="flex items-center">
              <Globe className="mr-2 h-4 w-4 opacity-70" />
              <span>Select country</span>
            </div>
          )}
          
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-full min-w-[300px] max-w-[400px] shadow-2xl"
        style={{ 
          zIndex: 9999,
          backgroundColor: 'rgb(30, 41, 59)',
          border: '1px solid rgba(148, 163, 184, 0.5)'
        }}
        side="bottom"
        align="start"
      >
        <Command className="bg-slate-800 text-white border-0">
          <CommandInput 
            placeholder="Search country..." 
            className="bg-slate-700 text-white border-slate-600 placeholder:text-white/50"
            autoFocus
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty className="text-white/70 py-6 text-center">
            No country found.
          </CommandEmpty>
          <CommandGroup>
            <CommandList 
              className="max-h-[300px] overflow-auto bg-slate-800"
            >
              <AnimatePresence>
                {filteredCountries.map((country) => (
                  <motion.div
                    key={country.value}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CommandItem
                      value={country.value}
                      onSelect={() => handleSelectCountry(country.value)}
                      keywords={[country.label, country.value]}
                      className="text-white hover:bg-slate-700 cursor-pointer data-[selected=true]:bg-slate-600 py-3 px-3 rounded-none"
                    >
                      <div className="flex items-center w-full">
                        <span className="mr-3 text-lg">{country.flag}</span>
                        <span className="font-medium flex-1">{country.label}</span>
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            value === country.value ? "opacity-100 text-blue-400" : "opacity-0"
                          )}
                        />
                      </div>
                    </CommandItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
