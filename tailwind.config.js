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
        "primary-ink": "rgb(var(--primary-ink) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        "success-light": "rgb(var(--success-light) / <alpha-value>)",
        "success-ink": "rgb(var(--success-ink) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        "warning-light": "rgb(var(--warning-light) / <alpha-value>)",
         "warning-ink": "rgb(var(--warning-ink) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        "danger-light": "rgb(var(--danger-light) / <alpha-value>)",
        "danger-ink": "rgb(var(--danger-ink) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
        "info-light": "rgb(var(--info-light) / <alpha-value>)",
        "info-ink": "rgb(var(--info-ink) / <alpha-value>)",

      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        glow: "var(--shadow-glow)",
        modal: "var(--shadow-modal)",
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