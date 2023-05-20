import type { Config } from 'tailwindcss'

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    screens: { xs: "360px", sm: "480px", md: "768px", lg: "992px", xl: "1280px", "2xl": "1536px" },
    extend: {
      keyframes: {
        "slide-up": {
          from: { opacity: '0', transform: "translateY(20px)" },
          to: { opacity: '1', transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: '1', transform: "translateY(0)" },
          to: { opacity: '0', transform: "translateY(20px)" },
        },
        "arrow-in": {
          from: { transform: "translate(-50%, 16px) rotate(45deg)", opacity: '0' },
          to: { transform: "translate(-50%, -4px) rotate(45deg)", opacity: '1' },
        },
        "arrow-out": {
          from: { transform: "translate(-50%, -4px) rotate(45deg)", opacity: '1' },
          to: { transform: "translate(-50%, 16px) rotate(45deg)", opacity: '0' },
        },
      },
      animation: {
        "slide-up": "slide-up 0.2s ease",
        "slide-down": "slide-down 0.2s ease",
        "arrow-in": "arrow-in 0.2s forwards",
        "arrow-out": "arrow-out 0.2s forwards",
      },
    },
  },
  plugins: [require("windy-radix-palette"), require("tailwindcss-animate")],
} satisfies Config

