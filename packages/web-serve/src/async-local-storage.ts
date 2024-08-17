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
