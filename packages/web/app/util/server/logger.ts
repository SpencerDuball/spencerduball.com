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
