import { Ddb } from "@spencerduballcom/db/ddb";
import { createClient, type PgClient } from "@spencerduballcom/db/pg";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import pino, { Logger } from "pino";
import { format } from "prettier";
import { randomUUID } from "crypto";

// define globals
declare global {
  var __ddbClient: Ddb;
  var __s3Client: S3Client;
  var __pgClient: PgClient;
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
export function pg() {
  if (!global.__pgClient) global.__pgClient = createClient(Config.DATABASE_URL);
  return global.__pgClient;
}

/**
 * Retrieves the pino logger function with common configuration. This adds a `traceId` that is useful for parsing which
 * request a log message belongs to. In Remix, we commonly have multiple requests running in parallel and the ability
 * to determine which messages belong to which action/loader is helpful.
 *
 * @returns Logger
 */
export function logger() {
  return pino().child({ traceId: randomUUID() });
}

//----------------------------------------------------------------------------
// Define Common Logger Functions
//----------------------------------------------------------------------------
export async function logRequest(logger: Logger, request: Request) {
  const req = request.clone();

  logger.info("---- START REQUEST INFO ----");
  logger.info(`Request: ${req.method} ${req.url}`);
  logger.info(`Cache: ${req.cache}, Keep-Alive: ${req.keepalive}, Mode: ${req.mode}`);
  logger.info(
    `Headers: ${await format(JSON.stringify(Object.fromEntries(req.headers.entries())), { parser: "json" })}`
  );
  logger.info(`Body:\n${await req.text().catch((e) => "No body text.")}`);
  logger.info("----- END REQUEST INFO -----");
}
