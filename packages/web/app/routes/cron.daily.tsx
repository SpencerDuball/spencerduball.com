import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { ZEnv } from "~/util";
import { db, getLogger } from "~/util/server";
import { sql } from "kysely";
// @ts-ignore
import ms from "ms";
import { randomBytes } from "crypto";

/**
 * Check if the request is authorized to access the cron.daily route.
 */
async function checkIfAuthorized(request: Request) {
  const logger = getLogger();
  const env = ZEnv.parse(process.env);

  // extract the Authorization header
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    logger.warn({ traceId: "96344d44" }, "No Authorization header found in the request.");
    throw new Response("Unauthorized", { status: 401 });
  }

  // ensure the Bearer token is valid
  const token = authHeader.match(/Bearer\s+(?<token>\w+)/i);
  if (!token) {
    logger.warn({ traceId: "3ebf40d4" }, "Invalid Authorization header found in the request.");
    throw new Response("Unauthorized", { status: 401 });
  } else if (token.groups?.token !== env.CRON_CLIENT_SECRET) {
    logger.warn({ traceId: "42359a50" }, "Invalid Bearer token found in the request.");
    throw new Response("Unauthorized", { status: 401 });
  }
}

interface TaskStatus {
  task: string;
  status: string;
}

/**
 * Remove expired OAuth state codes from the database.
 */
async function removeExpiredOauthStateCodes(): Promise<TaskStatus> {
  const logger = getLogger();

  logger.info({ traceId: "23f64e59" }, "Removing expired OAuth state codes.");
  const status = await db
    .deleteFrom("oauth_state_codes")
    .where("expires_at", "<", sql<string>`(datetime('now'))`)
    .executeTakeFirstOrThrow()
    .then((res) => {
      logger.info(`Success: Removed ${res.numDeletedRows} expired OAuth state codes.`);
      return { task: "RemoveExpiredOAuthStateCodes", status: "success" };
    })
    .catch((e) => {
      logger.error({ traceId: "60054632", error: e }, "Failed to remove expired OAuth state codes.");
      return { task: "RemoveExpiredOAuthStateCodes", status: "failure" };
    });

  return status;
}

/**
 * Remove expired sessions from the database.
 */
async function removeExpiredSessions(): Promise<TaskStatus> {
  const logger = getLogger();

  logger.info("Removing expired sessions.");
  const status = await db
    .deleteFrom("sessions")
    .where("expires_at", "<", sql<string>`(datetime('now'))`)
    .executeTakeFirstOrThrow()
    .then((res) => {
      logger.info({ traceId: "f1d3f713" }, `Success: Removed ${res.numDeletedRows} expired sessions.`);
      return { task: "RemoveExpiredSessions", status: "success" };
    })
    .catch((e) => {
      logger.error({ traceId: "fdfbed2c", error: e }, "Failed to remove expired sessions.");
      return { task: "RemoveExpiredSessions", status: "failure" };
    });

  return status;
}

/**
 * Remove expired session secrets from the database.
 */
async function removeExpiredSessionSecrets(): Promise<TaskStatus> {
  const logger = getLogger();

  logger.info({ traceId: "51815496" }, "Removing expired session secrets.");
  const status = await db
    .deleteFrom("session_secrets")
    .where("expires_at", "<", sql<string>`(datetime('now'))`)
    .executeTakeFirstOrThrow()
    .then((res) => {
      logger.info({ traceId: "e6f094a7" }, `Success: Removed ${res.numDeletedRows} expired session secrets.`);
      return { task: "RemoveExpiredSessionSecrets", status: "success" };
    });

  return status;
}

/**
 * Create new session secret in the database.
 *
 * This function will inspect the last session secret in the database and create a new
 * secret if the last secret was created more than 30 days ago or if there aren't any
 * session secrets in th database.. This will ensure that at any given time, there will
 * be three non-expired session secrets in the database.
 */
async function createNewSessionSecret() {
  const logger = getLogger();

  logger.info({ traceId: "e686736b" }, "Retrieving last session secret ...");
  const lastSecret = await db
    .selectFrom("session_secrets")
    .selectAll()
    .orderBy("created_at", "desc")
    .limit(1)
    .executeTakeFirst();
  logger.info({ traceId: "dc63e4d2" }, "Retrieved last session secret.");

  logger.info({ traceId: "86b37093" }, "Checking if a new session secret should be created ...");
  const oneMonthAgo = new Date(Date.now() - ms("30d")).toISOString();
  if (lastSecret === undefined || lastSecret.created_at < oneMonthAgo) {
    logger.info({ traceId: "2991c748" }, "Creating a new session secret ...");
    const status = await db
      .insertInto("session_secrets")
      .values({ id: randomBytes(16).toString("hex") })
      .executeTakeFirstOrThrow()
      .then(() => {
        logger.info({ traceId: "6b9ec9ad" }, "Success: Created a new session secret.");
        return { task: "CreateNewSessionSecret", status: "success" };
      })
      .catch((e) => {
        logger.error({ traceId: "df8f0fef", error: e }, "Failed to create a new session secret.");
        return { task: "CreateNewSessionSecret", status: "failure" };
      });
    return status;
  } else {
    logger.info({ traceId: "141cac38" }, "A new session secret is not needed at this time.");
    return { task: "CreateNewSessionSecret", status: "success" };
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await checkIfAuthorized(request);

  const tasks = await Promise.all([
    removeExpiredOauthStateCodes(),
    removeExpiredSessions(),
    removeExpiredSessionSecrets(),
    createNewSessionSecret(),
  ]);

  return json({ tasks });
};
