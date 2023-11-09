import type { Config } from "tailwindcss";
import { createPlugin } from "windy-radix-palette";

// define the tailwind colors
const colors = createPlugin();

export default {
  content: ["./app/**/*.{js,jsx,js,tsx}"],
  darkMode: "class",
  theme: {
    screens: { xs: "360px", sm: "480px", md: "768px", lg: "992px", xl: "1280px", "2xl": "1536px" },
    extend: {},
  },
  plugins: [colors.plugin, require("tailwindcss-animate")],
} satisfies Config;
