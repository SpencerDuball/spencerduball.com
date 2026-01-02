import { type Config } from "prettier";

const config: Config = {
  printWidth: 120,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["tv"],
};

export default config;
