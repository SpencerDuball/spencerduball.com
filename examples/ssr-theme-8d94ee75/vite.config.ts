import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";

const config = defineConfig({
  plugins: [devtools(), nitro(), tailwindcss(), tanstackStart(), react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

export default config;
