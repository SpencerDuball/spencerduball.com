# Server

This document will go into detail about why a custom server was created for this app, and then into the implementation details of this server.

## Motivation

As noted in the [Server Context](./server-context.md) design document, the impetus to explore creating a custom server for this app was due to a limitation in Remix whereby there is not a single location from which code can be run before any given loader or action. Initially I wanted to use the `AsyncLocalStorage` NodeJS API to have a request ID and logger available through a request context, and the solution I settled on was to create a custom express server to facilitate this.

After researching more into a custom express server, there were a few more reasons why this was a compelling option. From a high level thise reasons are:

- The `@remix-run/serve` package does not support loading a `.env` file, I wanted to add this.
- The `@remix-run/serve` package appears to have some unnecessary code, I wanted to update this file.
- I wanted to implement a central `AsyncLocalStorage` context for better log tracing.
- I wanted to use the `pino-http` middleware for logging request and response instead of `morgan`.
- I may want to add WebSockets endpoints, which would require a custom server. This gives the flexibility to implement this whenever.

## Implementation

Remix is techincally not a web server, it is a handler that can be used within any existing web server to handle requests. A Remix app must be used with an adapter for the platform the server will run on, for example [`@remix-run/express`](https://github.com/remix-run/remix/tree/7c0366fc73e513f55fe643291d1b5669d62ad13d/packages/remix-express).

We can use this adapter to create an Express server, which is what the default commands for `build` and `dev` do in a Remix app. The `build` command uses `@remix-run/serve` package, and the `dev` command uses the `@remix-run/dev` package to create a Vite development server.

The Remix team has also provided a template for a custom Express server. This custom server will be based on both the Express Template and the `@remix-run/serve` package.

```ts
import { createRequestHandler } from "@remix-run/express";
import { type ServerBuild } from "@remix-run/server-runtime";
import { type ViteDevServer } from "vite";
import compression from "compression";
import express from "express";
import { stdSerializers } from "pino-http";
import pino from "pino";
import path from "path";
import { config } from "@dotenvx/dotenvx";
import { randomUUID } from "crypto";
import { context } from "./async-local-storage.js";

// This file is build following the patterns from two files from the Remix project:
// - Custom Express Template
//   https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/templates/express/server.js
// - Remix-Serve
//   https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/packages/remix-serve/cli.ts

/**
 * Get the build path from the command line arguments.
 */
function getBuildPath() {
  const buildPathArg = process.argv[2];

  if (!buildPathArg) {
    console.log(
      "Usage: web-serve <server-build-path> - e.g. web-serve ./build/server/index.js"
    );
    process.exit(1);
  }

  return path.resolve(buildPathArg);
}

/**
 * Create a Vite dev server.
 *
 * When not in production, we will use Vite to build the app, provide HMR, etc. We use a dynamic import to avoid
 * loading Vite in production. We create a server with `middleWareMode: true` to configure Vite to run as
 * middleware within another server (in this case, Express). We also specify `appType: "custom"` which tells Vite
 * not to fallback to it's default handling of requests (which is serving an index.html file). This appType is
 * not necessary as we are handling all requests with the Remix request handler, but is techincally more correct.
 *
 * See the docs for more information:
 * - https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server
 */
async function getViteDevServer() {
  return await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
      appType: "custom",
    })
  );
}

/**
 * Get the Vite build.
 *
 * This function loads the Remix server's virtual module that Vite creates during development. Accessing the virtual
 * module allows for HMR and other development features.
 *
 * See the reference in the @remix-run/dev package where the virtual module is defined:
 * - https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/packages/remix-dev/vite/plugin.ts#L289
 *
 * See the reference in Vite about virtual modules:
 * - https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention
 */
async function getViteBuild(viteDevServer: ViteDevServer) {
  return viteDevServer.ssrLoadModule(
    "virtual:remix/server-build"
  ) as Promise<ServerBuild>;
}

/**
 * The main function that starts the server.
 *
 * @example
 * NODE_ENV=development node --enable-source-maps web-serve ./build/server/index.js
 *
 * @example
 * NODE_ENV=production node --enable-source-maps web-serve ./build/server/index.js
 *
 */
async function main() {
  // load environment variables
  config();

  // create the viteDevServer if not in production
  let viteDevServer: ViteDevServer | null = null;
  if (process.env.NODE_ENV !== "production") {
    viteDevServer = await getViteDevServer();
  }

  // create the remix request handler
  const remixHandler = createRequestHandler({
    build:
      viteDevServer !== null
        ? () => getViteBuild(viteDevServer)
        : await import(getBuildPath()),
  });

  // create the express server
  const app = express();

  app.use(compression());

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by");

  // handle asset requests
  if (viteDevServer !== null) {
    app.use(viteDevServer.middlewares);
  } else {
    // Vite fingerprints it's assets so we can cache forever
    app.use(
      "/assets",
      express.static("build/client/assets", { immutable: true, maxAge: "1y" })
    );

    // Everything else (like favicon.ico) can be cached for 1 hour. You may want to be more aggressive with this
    // caching.
    app.use(express.static("build/client", { maxAge: "1h" }));
  }

  // handle SSR requests
  app.all("*", async (req, res, next) => {
    // create reqId and logger
    const reqId = randomUUID();
    const logger = pino().child({ reqId });

    // handle the request
    logger.info(stdSerializers.req(req), "Request received");
    await context.run({ reqId }, () => remixHandler(req, res, next));
    logger.info(stdSerializers.res(res), "Request completed");
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`[web-serve] Listening at http://localhost:${port}`)
  );
}

main();
```

# References

- [Remix Runtime and Adapters](https://remix.run/docs/en/main/discussion/runtimes)
- [@remix-run/serve](https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/packages/remix-serve/cli.ts)
- [@remix-run/express](https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/packages/remix-express/server.ts)
- [(Template) remix-express](https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/templates/express/server.js)
- [Vite Dev Server](https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server)
