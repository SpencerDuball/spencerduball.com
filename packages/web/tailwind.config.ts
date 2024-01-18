import type { Config } from "tailwindcss";
import { createPlugin } from "windy-radix-palette";

// define the tailwind colors
const colors = createPlugin();

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    screens: { xs: "360px", sm: "480px", md: "768px", lg: "992px", xl: "1280px", "2xl": "1536px" },
    extend: {
      keyframes: {
        // header menu
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(20px)" },
        },
        "arrow-in": {
          from: { transform: "translate(-50%, 16px) rotate(45deg)", opacity: "0" },
          to: { transform: "translate(-50%, -4px) rotate(45deg)", opacity: "1" },
        },
        "arrow-out": {
          from: { transform: "translate(-50%, -4px) rotate(45deg)", opacity: "1" },
          to: { transform: "translate(-50%, 16px) rotate(45deg)", opacity: "0" },
        },
        // dialog modal
        "overlay-show": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "content-show": {
          from: { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
      },
      animation: {
        // header menu
        "slide-up": "slide-up 0.2s ease",
        "slide-down": "slide-down 0.2s ease",
        "arrow-in": "arrow-in 0.2s forwards",
        "arrow-out": "arrow-out 0.2s forwards",
        // dialog modal
        "overlay-show": "overlay-show 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "content-show": "content-show 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [colors.plugin, require("tailwindcss-animate")],
} satisfies Config;
