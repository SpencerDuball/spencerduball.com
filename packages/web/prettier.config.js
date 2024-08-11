/** @type {import("prettier").Config} */
const config = {
  printWidth: 120,
  tailwindFunctions: ["cn", "cva"],
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
