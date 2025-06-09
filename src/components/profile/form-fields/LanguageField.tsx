
import { Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Profile } from "@/types/profile";

interface LanguageFieldProps {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

export const LanguageField = ({ profile, setProfile }: LanguageFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<{value: string, label: string}>();
  
  const languages = [
    { value: "en", label: "English" },
    { value: "de", label: "German" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "it", label: "Italian" }
  ];
  
  // Set current language safely
  useEffect(() => {
    if (profile?.preferred_language) {
      const lang = languages.find(lang => lang.value === profile.preferred_language) || languages[0];
      setCurrentLanguage(lang);
    } else {
      setCurrentLanguage(languages[0]);
    }
  }, [profile?.preferred_language]);
  
  return (
    <div className="space-y-2">
      <Label className="text-white">Preferred Language</Label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full relative flex items-center gap-3 px-4 py-3 rounded-xl",
            "bg-white/10 backdrop-blur-sm text-white",
            "shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.05),_inset_2px_2px_5px_rgba(0,0,0,0.1)]",
            "hover:shadow-[inset_-3px_-3px_7px_rgba(255,255,255,0.07),_inset_3px_3px_7px_rgba(0,0,0,0.15)]",
            "transition-all duration-200"
          )}
        >
          <Globe className="h-4 w-4 text-white/60" />
          <span className="text-left flex-grow">{currentLanguage?.label || "English"}</span>
          <svg
            className={`h-4 w-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-xl animate-fadeIn">
            <div className="p-1 backdrop-blur-lg bg-white/10 border border-white/10">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => {
                    if (profile) {
                      setProfile({ ...profile, preferred_language: lang.value });
                    }
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-white flex items-center justify-between",
                    lang.value === profile?.preferred_language 
                      ? "bg-white/20 shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.05),_inset_2px_2px_5px_rgba(0,0,0,0.1)]" 
                      : "hover:bg-white/10"
                  )}
                >
                  {lang.label}
                  {lang.value === profile?.preferred_language && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
