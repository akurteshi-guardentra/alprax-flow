
import { useTranslation } from 'react-i18next';
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' }, // Arabic
  { code: 'zh', name: '中文' }, // Chinese
  { code: 'hi', name: 'हिन्दी' }, // Hindi
  { code: 'bn', name: 'বাংলা' }, // Bengali
  { code: 'sq', name: 'Shqip' }
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);
  const isMobile = useIsMobile();
  
  // Use effect to safely set the current language
  useEffect(() => {
    if (i18n.language) {
      const lang = languages.find(lang => lang.code === i18n.language) || languages[0];
      setCurrentLang(lang);
    }
  }, [i18n.language]);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl",
          "bg-gradient-to-r from-slate-700 to-slate-800 text-white",
          "border border-slate-600",
          "hover:bg-slate-700 transition-all duration-200",
          isMobile ? "touch-target active-scale" : ""
        )}
      >
        <Globe className="h-4 w-4 text-blue-400" />
        <span>{isMobile ? '' : currentLang.name}</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-[140px] z-50 overflow-hidden rounded-xl animate-fadeIn">
          <div className="p-1 backdrop-blur-lg bg-slate-800 border border-slate-700">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-white flex items-center justify-between",
                  lang.code === i18n.language 
                    ? "bg-blue-600/20 text-blue-400" 
                    : "hover:bg-slate-700/50"
                )}
              >
                {lang.name}
                {lang.code === i18n.language && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
