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

The Remix team has also provided a template for a custom Express server. This custom server will be based on both the Express Template and the `@remix-run/serve` package. The [web-serve](/packages/web-serve/src/web-serve.ts) package is the web server, and is well documented+commented, read this file to understand more. You should compare and contrast with the two files it is derived from (noted in the references section).

# References

- [Remix Runtime and Adapters](https://remix.run/docs/en/main/discussion/runtimes)
- [@remix-run/serve](https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/packages/remix-serve/cli.ts)
- [@remix-run/express](https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/packages/remix-express/server.ts)
- [(Template) remix-express](https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/templates/express/server.js)
- [Vite Dev Server](https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server)
