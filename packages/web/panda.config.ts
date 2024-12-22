import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-panda"],
  include: ["./app/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
});
