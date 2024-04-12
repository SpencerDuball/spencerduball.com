import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import tailwindCssAnimate from "tailwindcss-animate";
import * as radixColors from "@radix-ui/colors";

/**
 * Override Tailwind CSS color palette.
 *
 * @see https://tailwindcss.com/docs/plugins#extending-the-configuration
 */
function buildColors() {
  return {
    transparent: "transparent",
    current: "currentColor",
    black: "black",
    white: "white",
    ...formatRadixColors(),
  };
}

/**
 * Format Radix colors into Tailwind CSS format.
 *
 * @example blueDark.blue1 -> bluedark.1
 */
function formatRadixColors() {
  const colors: Record<string, Record<string, string>> = {};

  for (const [radixColorName, radixColor] of Object.entries(radixColors)) {
    const colorName = radixColorName.toLowerCase();
    const color: Record<string, string> = {};

    for (const [radixScale, value] of Object.entries(radixColor)) {
      const scale = radixScale.match(/\d+$/)?.[0];
      if (!scale) {
        continue;
      }
      color[scale] = value;
    }

    colors[colorName] = color;
  }

  return colors;
}

export default {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: { xs: "360px", sm: "480px", md: "768px", lg: "992px", xl: "1280px", "2xl": "1536px" },
    colors: buildColors(),
    extends: {
      fontFamily: { sans: ["Inter Variable", ...fontFamily.sans] },
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
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      // header menu
      "slide-up": "slide-up 0.2s ease",
      "slide-down": "slide-down 0.2s ease",
      "arrow-in": "arrow-in 0.2s forwards",
      "arrow-out": "arrow-out 0.2s forwards",
    },
  },
  plugins: [tailwindCssAnimate],
} as Config;
