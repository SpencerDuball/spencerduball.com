import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// This is a workaround for the "unstable_singleFetch" feature flag. This is a temporary
// workaround until the feature flag is removed.
//
// See: https://remix.run/docs/en/dev/guides/single-fetch#enable-single-fetch-types
declare module "@remix-run/server-runtime" {
  // or cloudflare, deno, etc.
  interface Future {
    unstable_singleFetch: true;
  }
}

export default defineConfig({
  // The package "react-use" does not properly configure the "type" field for the export and this causes a plethora of
  // issues with Vite based projects. This is a workaround noted in this issue:
  // https://github.com/streamich/react-use/issues/2353#issuecomment-2044683620
  ssr: {
    noExternal: ["react-use"],
  },
  optimizeDeps: {
    include: ["react-use"],
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_singleFetch: true, // Temporary, see: https://remix.run/docs/en/dev/guides/single-fetch#enabling-single-fetch
      },
    }),
    tsconfigPaths(),
  ],
});
