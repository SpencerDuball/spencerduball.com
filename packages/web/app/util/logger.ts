import { AsyncLocalStorage } from "async_hooks";
import { pino, type Logger } from "pino";
import { randomUUID } from "crypto";

export interface IRequestContext {
  logger: Logger;
}

export const context = new AsyncLocalStorage<IRequestContext>();

export function withContext<R>(callback: () => R): R {
  const logger = pino().child({ requestId: randomUUID() });
  return context.run({ logger }, callback);
}

export function getLogger(): Logger {
  const logger = context.getStore()?.logger;
  if (!logger) throw new Error("Logger not found in context");
  return logger;
}
