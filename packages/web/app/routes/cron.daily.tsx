import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { ZEnv } from "~/util";
import { db, getLogger } from "~/util/server";
import { sql } from "kysely";

/**
 * Check if the request is authorized to access the cron.daily route.
 */
async function checkIfAuthorized(request: Request) {
  const logger = getLogger();
  const env = ZEnv.parse(process.env);

  // extract the Authorization header
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    logger.error("No Authorization header found in the request.");
    throw new Response("Unauthorized", { status: 401 });
  }

  // ensure the Bearer token is valid
  const token = authHeader.match(/Bearer\s+(?<token>\w+)/i);
  if (!token) {
    logger.error("Invalid Authorization header found in the request.");
    throw new Response("Unauthorized", { status: 401 });
  } else if (token.groups?.token !== env.CRON_CLIENT_SECRET) {
    logger.error("Invalid Bearer token found in the request.");
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

  logger.info("Removing expired OAuth state codes.");
  const status = await db
    .deleteFrom("oauth_state_codes")
    .where("expires_at", "<", sql<string>`(datetime('now'))`)
    .executeTakeFirstOrThrow()
    .then((res) => {
      logger.info(`Success: Removed ${res.numDeletedRows} expired OAuth state codes.`);
      return { task: "RemoveExpiredOAuthStateCodes", status: "success" };
    })
    .catch((err) => {
      logger.error(err, "Failed to remove expired OAuth state codes.");
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
      logger.info(`Success: Removed ${res.numDeletedRows} expired sessions.`);
      return { task: "RemoveExpiredSessions", status: "success" };
    })
    .catch((err) => {
      logger.error(err, "Failed to remove expired sessions.");
      return { task: "RemoveExpiredSessions", status: "failure" };
    });

  return status;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await checkIfAuthorized(request);
  const tasks = await Promise.all([removeExpiredOauthStateCodes(), removeExpiredSessions()]);
  return json({ tasks });
};
