/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: "#0A0A0A",
        surface: "#141414",
        "surface-hover": "#1C1C1C",
        elevated: "#1A1A1A",

        // Borders
        border: "#262626",
        edge: "#333333",

        // Text
        text: "#FAFAFA",
        muted: "#8B8B8B",

        // Brand — crimson red
        primary: "#DC2626",
        "primary-hover": "#B91C1C",
        "primary-dark": "#7F1D1D",
        "primary-light": "#2A0F0F",

        // Semantic (dark-friendly)
        success: "#22C55E",
        "success-light": "#0F2A18",
        warning: "#F59E0B",
        "warning-light": "#2A1F0A",
        danger: "#EF4444",
        "danger-light": "#2A0F0F",
        info: "#3B82F6",
        "info-light": "#0F1A2A",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.5)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.6), 0 1px 2px -1px rgb(0 0 0 / 0.5)",
        "card-hover": "0 4px 16px 0 rgb(220 38 38 / 0.15), 0 2px 4px 0 rgb(0 0 0 / 0.5)",
        glow: "0 0 24px 0 rgb(220 38 38 / 0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgb(220 38 38 / 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgb(220 38 38 / 0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-in-right": "slide-in-right 250ms ease-out",
        shimmer: "shimmer 1.5s infinite linear",
        "pulse-glow": "pulse-glow 2s infinite",
      },
    },
  },
  plugins: [],
};