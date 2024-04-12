import pino, { Logger } from "pino";
import { randomUUID } from "crypto";

/**
 * Creates a pino logger with common configuration and sets up a traceId.
 */
function logger(request: Request): Logger {
  const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    base: { traceId: request.headers.get("x-trace-id") || randomUUID() },
  });

  logger.info({ request: { url: request.url, method: request.method } });

  return logger;
}

export { logger };
