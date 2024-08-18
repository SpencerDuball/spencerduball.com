# Server Context

This document is about how to implement a "server context" using `AsyncLocalStorage`. Note that this is the NodeJS implementation of the `AsyncContext API` - which is the TC39 proposal for the same thing as `AsyncLocalStorage`.

## Motivation

Initially I wanted to use the `AsyncLocalStorage` API that NodeJS provides so that I could share a request ID/logger instance throught the server code without needing to pass the logger to every nested function call within a request. This [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html#class-asynclocalstorage) is an API that works very similar to React's Context API and is based upon function [Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures).

After reading up on how to implement this in the current version of Remix there appeared to be three ways to implement this:

1. Wrap every `loader` and `action` in an `AsyncLocalStorage` context.
2. Create a custom server that wraps each Remix request handler in an `AsyncLocalStorage` context.
3. (Future) Use the future [Remix middleware RFC](https://github.com/remix-run/remix/discussions/7642). At the time of writing this is just an RFC and not behing a future flag similar to other features Remix rolls out gradually.

As I explored the pros/cons of each of these the one I settled on was #2 - create a custom server. This document shows examples of these three options and each section will outline the pros/cons used to make this decision.

## Implementations

### Wrap All Loader/Action

We could wrap every loader and action in an `AsyncLocalStorage` context. This would allow us the benefits of not needing to pass a logger or request ID through every function. The pros of using this solution are that we don't need to implement a custom server and can use the `@remix-run/serve` package to handle this for us. The cons are that we need to wrap every loader+action with a context provider and the default middleware `app.use(morgan("tiny"))` as found in the [@remix-run/serve]() package would not contain the request ID.

I also have been using the `pino` logger along with the `pino-http` middleware so dropping `morgan` for `pino-http` was a motivation. Addtionally the `@remix-run/serve` package doesn't support loading `.env` files, however the `vite` server (used in development) does - these are other factors that drove me away from this approach.

```ts
// app/util/logger.ts
import { AsyncLocalStorage } from "async_hooks";
import { type Logger } from "pino";
import { randomUUID } from "crypto";

export interface IRequestContext {
  reqId: string;
  logger: Logger;
}

export const context = new AsyncLocalStorage<IRequestContext>();

export function withContext<ReturnType>(cb: () => ReturnType): ReturnType {
  const reqId = randomUUID();
  const logger = pino().child({ reqId });
  return context.run({ reqId, logger }, () => cb());
}

export function getLogger(): Logger {
  const logger = context.getStore()?.logger;
  if (logger) return logger;
  throw new Error("Could not find an AsyncLocalStorage context.");
}
```

```tsx
// app/routes/root.tsx
import { withContext, getLogger } from "~/util/logger";

export async function loader({ request }: LoaderFunctionArgs) {
  return withContext(() => {
    const resHeaders: HeadersInit = [];
    getLogger().info("Handling request ...");
    return json({ data: "some data" });
  });
}
```

### Custom Server

When writing a custom express server, we can wrap each request handler in an `AsyncLocalStorage` context. A pro of this approach is that this is a central solution so we don't need to wrap any loaders/actions. A con of this approach is that it is much more complex than just using a Remix solution - now we need to understand an implement a server. This server doesn't integrate with the Remix build process so now need to manage a separate build process as well.

This solution was preferred because I also wanted a custom server to use the `pino-http` middleware instead of the `morgan` middleware. Also some other updates such as adding `.env` support was a perk, plus in the future if I wanted to add WebSockets support I would need a custom server anyhow.

```ts
// web-serve.js
import { AsyncLocalStorage } from "async_hooks";

export interface IRequestContext {
  reqId: string;
}

// If we don't assign the context to the `globalThis` object we will get incorrect context objects due to how the
// request context is created. We must assign to `globalThis` and attempt to get the global object instead of
// creating a new object. See the comment here for this proposed solution:
// - https://github.com/remix-run/remix/discussions/4603#discussioncomment-7374742
export const context = ((globalThis as any).asyncLocalStorage ??=
  new AsyncLocalStorage<IRequestContext>()) as AsyncLocalStorage<IRequestContext>;

async function main() {
  // ... snip ...

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

  // ... snip ...
}
```

```ts
// app/util/logger.ts
import { pino, type Logger } from "pino";
import { context, IRequestContext } from "web-serve";

export interface IReqContext extends IRequestContext {
  logger: Logger;
}

/**
 * Gets the logger from the AsyncLocalStorage context.
 *
 * @returns
 */
export function getLogger(): Logger {
  const store = context.getStore() as IReqContext | undefined;
  if (store?.logger) return store.logger;
  else if (store?.reqId) {
    store.logger = pino().child({ reqId: store.reqId });
    return store.logger;
  } else {
    throw new Error("Could not find AsyncLocalStorage context.");
  }
}
```

```tsx
// app/routes/root.tsx
import { context } from "web-serve";

export async function loader({ request }: LoaderFunctionArgs) {
  const resHeaders: HeadersInit = [];
  getLogger().info("Handling request ...");
  return json({ data: "some data" });
}
```

### Future Remix Middleware

The future Remix Middleware would be the perfect solution, however this feature would run as middleware and would have a parallel closure, not a parent lexical context to your Remix request handler - e.g. the middleware is called before/after your Remix handler, your Remix handler is not called _within_ the middleware. The way `AsyncLocalStorage` works is by using JavaScript closures - therefore only option #1 or #2 are really valid. This RFC is not finalized so this may change in the future.

A full example of this can be found in this repository:

- https://github.com/kiliman/remix-express-vite-plugin/tree/main

# References

<u>AsyncLocalStorage:</u>

- [AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage)
- [AsyncLocalStorage vs AsyncContext](https://dev.to/syntax/asynclocalstorage-asynccontext-api)

<u>Remix Middleware:</u>

- [kiliman-middleware-vid](https://www.youtube.com/watch?v=_dbMs9D5kdQ&t=663s)
- [kiliman-middleware](https://github.com/kiliman/remix-express-vite-plugin)
- [Route Middleware RFC](https://github.com/remix-run/remix/discussions/7642)

<u>Custom Server</u>

- [@remix-run/serve](https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/packages/remix-serve/cli.ts)
- [@remix-run/express](https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/packages/remix-express/server.ts)
- [(Template) remix-express](https://github.com/remix-run/remix/blob/7c0366fc73e513f55fe643291d1b5669d62ad13d/templates/express/server.js)
