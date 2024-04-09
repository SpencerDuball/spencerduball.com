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
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
    },
  },
  plugins: [tailwindCssAnimate],
} as Config;
