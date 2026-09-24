/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-hover": "rgb(var(--surface-hover) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        edge: "rgb(var(--edge) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        "primary-hover": "rgb(var(--primary-hover) / <alpha-value>)",
        "primary-dark": "rgb(var(--primary-dark) / <alpha-value>)",
        "primary-light": "rgb(var(--primary-light) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        "success-light": "rgb(var(--success-light) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        "warning-light": "rgb(var(--warning-light) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        "danger-light": "rgb(var(--danger-light) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
        "info-light": "rgb(var(--info-light) / <alpha-value>)",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.1)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.15), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover":
          "0 4px 16px 0 rgb(220 38 38 / 0.15), 0 2px 4px 0 rgb(0 0 0 / 0.1)",
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