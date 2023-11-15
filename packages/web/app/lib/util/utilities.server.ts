import { Ddb } from "@spencerduballcom/db/ddb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import pino, { Logger } from "pino";
import { format } from "prettier";

// define globals
declare global {
  var __ddbClient: Ddb;
  var __logger: Logger;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Define Client Getters
 * ------------------------------------------------------------------------------------------------------------------ */
/**
 * Retrieves the pre-configured Ddb table object if it exists, or creates a new one.
 *
 * @returns Ddb
 */
export function getDdbClient() {
  if (!global.__ddbClient) {
    const ddbClient = new DynamoDBClient({ region: Config.REGION });
    global.__ddbClient = new Ddb({ tableName: Table.table.tableName, client: ddbClient });
  }
  return global.__ddbClient;
}

/**
 * Retrieves the pino logger function with common configuration.
 *
 * @returns Logger
 */
export function getLogger() {
  if (!global.__logger) {
    global.__logger = pino();
  }
  return global.__logger;
}

//----------------------------------------------------------------------------
// Define Common Logger Functions
//----------------------------------------------------------------------------
export async function logRequest(request: Request) {
  const logger = getLogger();
  const req = request.clone();

  logger.info("---- START REQUEST INFO ----");
  logger.info(`Request: ${req.method} ${req.url}`);
  logger.info(`Cache: ${req.cache}, Keep-Alive: ${req.keepalive}, Mode: ${req.mode}`);
  logger.info(
    `Headers: ${await format(JSON.stringify(Object.fromEntries(req.headers.entries())), { parser: "json" })}`
  );
  logger.info(`Body:\n${await req.text().catch((e) => "No body text.")}`);
  logger.info(`JSON:\n${await req.json().catch((e) => "No body json.")}`);
  logger.info("----- END REQUEST INFO -----");
}
