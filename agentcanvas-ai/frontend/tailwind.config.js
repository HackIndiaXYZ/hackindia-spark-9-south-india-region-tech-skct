/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#030014",
        card: "#0a0724",
        border: "#1f1a4a",
        accent: {
          purple: "#7c3aed",
          cyan: "#06b6d4",
          emerald: "#10b981",
          rose: "#f43f5e",
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 5px rgba(124, 58, 237, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
