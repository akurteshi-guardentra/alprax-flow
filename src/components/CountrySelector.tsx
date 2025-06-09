
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
  const handleSelectCountry = (value: string) => {
    const country = countries.find(c => c.value === value);
    if (country) {
      setSelectedCountry(country);
      onSelect(value);
      setOpen(false);
    }
  };
  
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
      <PopoverContent className="p-0 bg-slate-800/95 backdrop-blur-xl border-slate-700/50 w-full min-w-[280px] max-w-[350px] rounded-xl z-[100] shadow-2xl">
        <Command className="bg-transparent text-white rounded-lg">
          <CommandInput 
            placeholder="Search country..." 
            className="bg-black/20 text-white border-slate-600/50 focus-within:ring-1 focus-within:ring-white/20 rounded-t-lg"
            autoFocus
            id="country-search"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty className="text-white/70 py-2">No country found.</CommandEmpty>
          <CommandGroup>
          <CommandList className="max-h-[300px] overflow-auto custom-scrollbar">
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
                      key={country.value}
                      value={country.value}
                      onSelect={(currentValue) => {
                        handleSelectCountry(currentValue);
                        setOpen(false);
                      }}
                      keywords={[country.label]}
                      className="text-white hover:bg-white/10 cursor-pointer data-[selected=true]:bg-white/20 transition-colors flex items-center py-2 px-2 rounded-md active-scale"
                    >
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">{country.flag}</span>
                        <span>{country.label}</span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
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
