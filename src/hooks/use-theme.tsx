
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  systemTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    return storedTheme || defaultTheme;
  });
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Add system theme detection
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };
    
    // Set initial system theme
    handleChange();
    
    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    const activeTheme = theme === "system" ? systemTheme : theme;
    root.classList.add(activeTheme);
  }, [theme, systemTheme]);

  const value = {
    theme: theme === "system" ? systemTheme : theme,
    setTheme: (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem(storageKey, newTheme);
    },
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}
