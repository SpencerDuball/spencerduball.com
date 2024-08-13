import type { Config } from "tailwindcss";
import tailwindcssRadixColors from "tailwindcss-radix-colors";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: { xs: "360px", sm: "480px", md: "768px", lg: "992px", xl: "1280px", "2xl": "1536px" },
    keyframes: {
      // Header menu
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
      // Keyframes for the custom Radix UI components
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" },
      },
    },
    animation: {
      // Header menu
      "slide-up": "slide-up 0.2s ease",
      "slide-down": "slide-down 0.2s ease",
      "arrow-in": "arrow-in 0.2s forwards",
      "arrow-out": "arrow-out 0.2s forwards",
      // Animations for the custom Radix UI components
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
    },
    extend: {},
  },
  plugins: [tailwindcssRadixColors, tailwindcssAnimate],
} satisfies Config;
