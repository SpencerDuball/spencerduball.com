import { Ddb } from "@spencerduballcom/db/ddb";
import { createClient, type SqlDbClient } from "@spencerduballcom/db/sqldb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import pino, { Logger } from "pino";
import { randomUUID } from "crypto";

// define globals
declare global {
  var __ddbClient: Ddb | null;
  var __s3Client: S3Client | null;
  var __sqlClient: SqlDbClient | null;
  var __logger: Logger | null;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Define Client Getters
 * ------------------------------------------------------------------------------------------------------------------ */
/**
 * Retrieves the pre-configured Ddb table object if it exists, or creates a new one.
 *
 * @returns Ddb
 */
export function ddb() {
  if (!global.__ddbClient) {
    const ddbClient = new DynamoDBClient({ region: Config.REGION });
    global.__ddbClient = new Ddb({ tableName: Table.table.tableName, client: ddbClient });
  }
  return global.__ddbClient;
}

/**
 * Retrieves the S3Client if it exists, or creates a new one.
 *
 * @returns S3Client
 *
 */
export function s3() {
  if (!global.__s3Client) global.__s3Client = new S3Client({ region: Config.REGION });
  return global.__s3Client;
}

/**
 * Retrieves the pre-configured postgres client if it exists, or creates a new connection.
 *
 * @returns Pg
 */
export function sqldb() {
  if (!global.__sqlClient) {
    global.__sqlClient = createClient(Config.DATABASE_URL, Config.DATABASE_AUTH_TOKEN);
  }
  return global.__sqlClient;
}

//----------------------------------------------------------------------------
// Define Common Logger Functions
//----------------------------------------------------------------------------
/**
 * Logs the full request object.
 *
 * @params Reqeust
 */
export function logRequest(request: Request) {
  const log = getLogger();
  const req = request.clone();
  const url = new URL(req.url);
  const reqObj = {
    body: req.body,
    cache: req.cache,
    credentials: req.credentials,
    destination: req.destination,
    headers: req.headers,
    integrity: req.integrity,
    keepalive: req.keepalive,
    method: req.method,
    mode: req.mode,
    redirect: req.redirect,
    referrer: req.referrer,
    referrerPolicy: req.referrerPolicy,
    signal: req.signal,
    url: {
      hash: url.hash,
      host: url.host,
      hostname: url.hostname,
      href: url.href,
      origin: url.origin,
      password: url.password,
      pathname: url.pathname,
      port: url.port,
      protocol: url.protocol,
      search: url.search,
      searchParams: Object.fromEntries(url.searchParams.entries()),
      username: url.username,
    },
  };
  log.info({ request: reqObj });
}

/**
 * Creates a pino logger with common configuration. This adds a `traceId` that is useful for parsing which request a
 * log message belongs to. This should be used at the start of a request to ensure that a new logger context is
 * created so as not to reuse the old logger's configuration. If a Request object is supplied, it will log the
 * the request object.
 *
 * @param request - The request object.
 * @returns Logger
 */
export function logger(request?: Request) {
  global.__logger = pino().child({ traceId: randomUUID() });
  if (request) logRequest(request);
  return global.__logger;
}

/**
 * Retrieves the current pino logger to preserve common configuration. This is useful when trying to log nested deeply
 * in a call stack.
 *
 * @returns Logger
 */
export function getLogger() {
  if (global.__logger) return global.__logger;
  else return logger();
}
