import { z } from "zod";
import { Ddb } from "@spencerduballcom/ddb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { S3Client } from "@aws-sdk/client-s3";
import pino from "pino";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";

// define globals
declare global {
  var __ddbClient: Ddb;
  var __s3Client: S3Client;
  var __env: Record<string, string>;
}

//----------------------------------------------------------------------------
// Define Env Helpers
//----------------------------------------------------------------------------
// define the .env validator
export const ZEnv = z.object({
  STAGE: z.string(),
  REGION: z.string(),
  BUCKET_NAME: z.string(),
  BUCKET_URL: z.string(),
  TABLE_NAME: z.string(),
  DATABASE_URL_SECRET_PATH: z.string(),
  GITHUB_CLIENT_ID_PATH: z.string(),
  GITHUB_CLIENT_ID_SECRET_PATH: z.string(),
  SITE_URL_PATH: z.string(),
});
export type IEnv = z.infer<typeof ZEnv>;

// get secrets
export async function getSsmValue(name: string, isSecret?: boolean) {
  if (!global.__env) global.__env = {};
  if (!global.__env[name]) {
    global.__env[name] = await new SSMClient({ region: ZEnv.parse(process.env).REGION })
      .send(new GetParameterCommand({ Name: name, WithDecryption: isSecret }))
      .then(({ Parameter }) => z.object({ Value: z.string() }).parse(Parameter).Value);
  }
  return global.__env[name];
}

//----------------------------------------------------------------------------
// Define Client Getters
//----------------------------------------------------------------------------
/**
 * Retrieves the pre-configured Ddb table object if it exists, or creates a new
 * one.
 *
 * @returns Ddb
 */
export async function getDdbClient() {
  if (!global.__ddbClient) {
    const env = ZEnv.parse(process.env);
    const ddbClient = new DynamoDBClient({ region: env.REGION });
    global.__ddbClient = new Ddb({ tableName: env.TABLE_NAME, client: ddbClient });
  }
  return global.__ddbClient;
}

/**
 * Retrieves the S3Client if it exists, or creates a new one.
 *
 * @returns S3Client
 */
export async function getS3Client() {
  if (!global.__s3Client) {
    const env = ZEnv.parse(process.env);
    const s3Client = new S3Client({ region: env.REGION });
    global.__s3Client = s3Client;
  }
  return global.__s3Client;
}

//----------------------------------------------------------------------------
// Define Common Logger Functions
//----------------------------------------------------------------------------
/**
 * Returns the pino logger function with common configuration.
 *
 * @returns Pino
 */
export function getLogger() {
  return pino();
}

/**
 * Logs out full request information.
 *
 * @param request The request object.
 */
export async function logRequest(request: ActionArgs["request"] | LoaderArgs["request"]) {
  const logger = getLogger();
  const req = request.clone();

  logger.info("---- START REQUEST INFO ----");
  logger.info(`Request: ${req.method} ${req.url}`);
  logger.info(`Cache: ${req.cache}, Keep-Alive: ${req.keepalive}, Mode: ${req.mode}`);
  logger.info(`Headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`);
  logger.info(`Body:\n${await req.text().catch((e) => "No body text.")}`);
  logger.info(`JSON:\n${await req.json().catch((e) => "No body json.")}`);
  logger.info("---- END REQUEST INFO ----");
}
