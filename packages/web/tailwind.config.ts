import type { Config } from "tailwindcss";
import { createPlugin } from "windy-radix-palette";
import { slateA, slate, slateDark, blue, blueDark, green, greenDark } from "@radix-ui/colors";

// define the tailwind colors
const colors = createPlugin();

// define radix scale helpers, this is used when we need to override the default theme such as MDX code component
type IRadixScale = {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
};
function createRadixScale<T extends Record<string, string>>(color: T) {
  const c: Record<string, string> = {};
  Object.values(color).forEach((color, idx) => {
    c[idx + 1] = color;
  });
  return c as IRadixScale;
}

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
      },
      colors: {
        // added so overrides can work UI components nested in the code views
        slateALight: createRadixScale(slateA),
        slateLight: createRadixScale(slate),
        slateDark: createRadixScale(slateDark),
        blueLight: createRadixScale(blue),
        blueDark: createRadixScale(blueDark),
        greenLight: createRadixScale(green),
        greenDark: createRadixScale(greenDark),
      },
      animation: {
        // header menu
        "slide-up": "slide-up 0.2s ease",
        "slide-down": "slide-down 0.2s ease",
        "arrow-in": "arrow-in 0.2s forwards",
        "arrow-out": "arrow-out 0.2s forwards",
      },
    },
  },
  plugins: [colors.plugin, require("tailwindcss-animate"), require("tailwind-scrollbar")({ nocompatible: true })],
} satisfies Config;
