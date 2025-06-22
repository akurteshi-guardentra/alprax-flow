
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#3b82f6", // Modern blue from design tokens
          light: "#60a5fa",
          dark: "#1d4ed8",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#a855f7", // Purple from signup page
          light: "#c084fc",
          dark: "#7c3aed",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#0ea5e9", // Cyan accent
          light: "#38bdf8",
          dark: "#0284c7",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444", // Modern red
          light: "#f87171",
          dark: "#dc2626",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#10b981", // Modern green
          light: "#34d399",
          dark: "#059669",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b", // Modern amber
          light: "#fbbf24",
          dark: "#d97706",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Glass effect colors
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.1)",
          light: "rgba(255, 255, 255, 0.15)",
          dark: "rgba(0, 0, 0, 0.2)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-modern': 'linear-gradient(to bottom right, #1e3a8a, #1e40af, #7c3aed)',
        'gradient-card': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      boxShadow: {
        'modern': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'modern-lg': '0 20px 50px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "modern-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "modern-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "modern-slide-up": {
          from: { transform: "translateY(30px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "modern-fade-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "modern-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "modern-float": "modern-float 4s ease-in-out infinite",
        "modern-pulse": "modern-pulse 3s ease-in-out infinite",
        "modern-slide-up": "modern-slide-up 0.6s ease-out",
        "modern-fade-in": "modern-fade-in 0.5s ease-out",
        "modern-glow": "modern-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
