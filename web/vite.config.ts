import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";

const config = defineConfig({
  plugins: [
    devtools(),
    nitro(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        // enabled prerendering
        enabled: true,
        // if disabled, only the root path or the paths defined in the pages config will be prerendered
        autoStaticPathsDiscovery: true,
        // whether to extract links from the HTML and prerender them also
        crawlLinks: true,
        // fail if an error occurs during prerendering
        failOnError: true,
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

export default config;
