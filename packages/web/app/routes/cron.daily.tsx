import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { sql } from "kysely";
import { db, getLogger, ZEnv } from "~/util/server";

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
      logger.error({ traceId: "60054632", err: e }, "Failed to remove expired OAuth state codes.");
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
      logger.error({ traceId: "4d800431", err: e }, "Failed to remove expired sessions.");
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
    })
    .catch((e) => {
      logger.error({ traceId: "0d2b3f6e", err: e }, "Failed to remove expired session secrets.");
      return { task: "RemoveExpiredSessionSecrets", status: "failure" };
    });

  return status;
}

/**
 * Remove expired mock Github OAuth tokens from the database.
 */
async function removeExpiredMockGhOtcs(): Promise<TaskStatus> {
  const logger = getLogger();

  logger.info({ traceId: "2c5c4d0c" }, "Removing expired mock Github OAuth tokens.");
  const status = await db
    .deleteFrom("mock_gh_otcs")
    .where("expires_at", "<", sql<string>`(datetime('now'))`)
    .executeTakeFirstOrThrow()
    .then((res) => {
      logger.info({ traceId: "298dc46b" }, `Success: Removed ${res.numDeletedRows} expired mock Github OAuth tokens.`);
      return { task: "RemoveExpiredMockGhOtcs", status: "success" };
    })
    .catch((e) => {
      logger.error({ traceId: "390c4718", err: e }, "Failed to remove expired mock Github OAuth tokens.");
      return { task: "RemoveExpiredMockGhOtcs", status: "failure" };
    });

  return status;
}

/**
 * Remove expired mock Github access tokens from the database.
 */
async function removeExpiredMockGhAccessTokens(): Promise<TaskStatus> {
  const logger = getLogger();

  logger.info({ traceId: "791a25d0" }, "Removing expired mock Github access tokens.");
  const status = await db
    .deleteFrom("mock_gh_access_tokens")
    .where("expires_at", "<", sql<string>`(datetime('now'))`)
    .executeTakeFirstOrThrow()
    .then((res) => {
      logger.info({ traceId: "3b94513d" }, `Success: Removed ${res.numDeletedRows} expired mock Github access tokens.`);
      return { task: "RemoveExpiredMockGhAccessTokens", status: "success" };
    })
    .catch((e) => {
      logger.error({ traceId: "33f85926", err: e }, "Failed to remove expired mock Github access tokens.");
      return { task: "RemoveExpiredMockGhAccessTokens", status: "failure" };
    });

  return status;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await checkIfAuthorized(request);

  const tasks = await Promise.all([
    removeExpiredOauthStateCodes(),
    removeExpiredSessions(),
    removeExpiredSessionSecrets(),
    removeExpiredMockGhOtcs(),
    removeExpiredMockGhAccessTokens(),
  ]);

  return json({ tasks });
};
