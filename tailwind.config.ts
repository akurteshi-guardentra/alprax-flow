
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
    extend: {      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#5469D4", // Modern indigo
          light: "#7C8EF5",
          dark: "#3A4AA0",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#00C6A2", // Modern teal
          light: "#1AEAC3",
          dark: "#009E82",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FF7D00", // Vibrant orange
          light: "#FF9A3D",
          dark: "#E56A00",
          foreground: "#FFFFFF",
        },        destructive: {
          DEFAULT: "#FF4757", // Modern red
          light: "#FF6D7A",
          dark: "#D0384A",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#00D37F", // Modern green
          light: "#25F19E",
          dark: "#00A86C",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FFBD00", // Modern amber
          light: "#FFCB33",
          dark: "#E6A500",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        surface: {
          light: "#F7F9FC",
          dark: "#1A1F36",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        kosovo: {
          blue: "#244AA5",
          yellow: "#D0A650",
        },
        neumorphic: {
          base: "#E0E5EC",
          light: "#FFFFFF",
          dark: "#A3B1C6",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-out",
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #244AA5 0%, #D0A650 100%)',
        'gradient-kosovo': 'linear-gradient(to right, #244AA5 0%, #D0A650 100%)',
      },
      boxShadow: {
        'neumorphic-flat': '5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.6)',
        'neumorphic-pressed': 'inset 5px 5px 10px rgba(163, 177, 198, 0.5), inset -5px -5px 10px rgba(255, 255, 255, 0.6)',
        'neumorphic-dark': '5px 5px 10px rgba(0, 0, 0, 0.2), -5px -5px 10px rgba(255, 255, 255, 0.05)',
        'neumorphic-dark-pressed': 'inset 5px 5px 10px rgba(0, 0, 0, 0.2), inset -5px -5px 10px rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
