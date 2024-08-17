import { createRequestHandler } from "@remix-run/express";
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
        console.log("Usage: web-serve <server-build-path> - e.g. web-serve ./build/server/index.js");
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
    return await import("vite").then((vite) => vite.createServer({
        server: { middlewareMode: true },
        appType: "custom",
    }));
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
async function getViteBuild(viteDevServer) {
    return viteDevServer.ssrLoadModule("virtual:remix/server-build");
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
    let viteDevServer = null;
    if (process.env.NODE_ENV !== "production") {
        viteDevServer = await getViteDevServer();
    }
    // create the remix request handler
    const remixHandler = createRequestHandler({
        build: viteDevServer !== null
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
    }
    else {
        // Vite fingerprints it's assets so we can cache forever
        app.use("/assets", express.static("build/client/assets", { immutable: true, maxAge: "1y" }));
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
    app.listen(port, () => console.log(`[web-serve] Listening at http://localhost:${port}`));
}
main();
