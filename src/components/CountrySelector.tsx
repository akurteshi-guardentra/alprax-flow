
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
            "w-full justify-between transition-all duration-300 rounded-xl",
            "bg-white/5 backdrop-blur-md border-white/10 text-white",
            "hover:bg-white/10 hover:border-white/20 hover:text-white",
            "group relative overflow-hidden",
            selectedCountry ? "font-medium" : "text-white/70",
            className
          )}
        >
          {selectedCountry ? (
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedCountry.value}
            >
              <span className="mr-2 text-lg">{selectedCountry.flag}</span>
              <span>{selectedCountry.label}</span>
            </motion.div>
          ) : (
            <div className="flex items-center">
              <Globe className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100" />
              <span>Select country</span>
            </div>
          )}
          
          {/* Background shine effect */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
          </div>
          
          <div className="flex items-center opacity-60 group-hover:opacity-100">
            <div className="w-px h-4 bg-white/20 mr-2 hidden sm:block"></div>
            <ChevronsUpDown className="h-4 w-4 shrink-0" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-full min-w-[280px] max-w-[350px] rounded-xl shadow-2xl"
        style={{ 
          zIndex: 50,
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.5)'
        }}
        side="bottom"
        align="start"
      >
        <Command 
          className="bg-transparent text-white rounded-lg"
          style={{ backgroundColor: 'transparent' }}
        >
          <CommandInput 
            placeholder="Search country..." 
            className="bg-slate-900/50 text-white border-slate-600/50 focus-within:ring-1 focus-within:ring-white/20 rounded-t-lg"
            autoFocus
            id="country-search"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty className="text-white/70 py-6 text-center">
            No country found.
          </CommandEmpty>
          <CommandGroup>
            <CommandList 
              className="max-h-[300px] overflow-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(148, 163, 184, 0.3) transparent'
              }}
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
                      className="text-white hover:bg-white/10 cursor-pointer data-[selected=true]:bg-white/20 transition-colors flex items-center justify-between py-3 px-3 rounded-md m-1"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-lg">{country.flag}</span>
                        <span className="font-medium">{country.label}</span>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          value === country.value ? "opacity-100 text-indigo-400" : "opacity-0"
                        )}
                      />
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
