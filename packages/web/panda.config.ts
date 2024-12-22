import { defineConfig } from "@pandacss/dev";
import pandaPreset from "@pandacss/preset-panda";

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-panda"],
  include: ["./app/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
});
