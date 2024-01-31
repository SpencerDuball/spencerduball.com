import { redirect } from "@remix-run/node";
import { ZSession } from "@spencerduballcom/db/ddb";
import { flashCookie, session } from "~/lib/util/sessions.server";
import Cookie from "cookie";
import { getLogger } from "~/lib/util/globals.server";
import { z } from "zod";
import { InferResult, Compilable, CompiledQuery } from "kysely";
import { sqldb } from "~/lib/util/globals.server";

/* ------------------------------------------------------------------------------------------------------------------
 * Session Utilities
 * -----------------
 * Session utitlies to help with all sorts of things such as common login redirect, retrieving+parsing session info.
 * ------------------------------------------------------------------------------------------------------------------ */
/**
 * This function will redirect the user to the login page and supply the current page as the return location.
 *
 * @param url The current url of the page.
 */
export function redirectToLogin(url: string) {
  const redirect_uri = new URL(`${new URL(url).origin}/auth/signin/github`);
  redirect_uri.searchParams.set("redirect_uri", url);
  throw redirect(redirect_uri.toString());
}

/**
 * Retrieves and validates the session info.
 *
 * @param Request - The request object.
 * @returns The typesafe session data.
 */
export async function getSessionInfo(request: Request) {
  return await session
    .getSession(request.headers.get("cookie"))
    .then((s) => ZSession.parse(s.data))
    .catch(() => null);
}

/**
 * Parses a cookie or set-cookie string and returns the cookie info for the passed in key. Typically we will define the
 * cookies using the Remix `createCookie` and then parse using this function, however when attempting to delete a cookie
 * this utility returns `null` for the cookie of the specified key. This function will return the cookie information even
 * if the cookie is being deleted.
 *
 * @param key - The key of the cookie we are parsing.
 */
export function parseCookie(key: string, cookie: string) {
  // split the cookie string by ',' to account for scenarios with multiple cookies
  const cookies = cookie.split(",").map((cookieStr) => cookieStr.trim());

  // parse each cookie and see if it has a key matching our key
  let result: Record<string, string> | null = null;
  for (let c of cookies) {
    const parsedCookie = Cookie.parse(c);
    if (Object.keys(parsedCookie).includes(key)) result = parsedCookie;
  }

  return result;
}

/**
 * A standard flash cookie to use when handling a 400 type request.
 */
export const flash400 = flashCookie.serialize({
  type: "error",
  placement: "top",
  title: "Error - 400",
  description: "Required inputs were not supplied.",
  duration: 5000,
});

/**
 * A standard flash cookie to use when handling a 401 type request.
 */
export const flash401 = flashCookie.serialize({
  type: "error",
  placement: "top",
  title: "Error - 401",
  description: "User is not authorized to access this resource.",
  duration: 500,
});

/**
 * A standard flash cookie to use when handling a 500 type request.
 */
export const flash500 = flashCookie.serialize({
  type: "error",
  placement: "top",
  title: "Error - 500",
  description: "Oops! Looks like an error on our side, please try again later.",
  duration: 5000,
});

/* ------------------------------------------------------------------------------------------------------------------
 * Kysely Utilities
 * -----------------
 * Wrappers for Kysely's "execute", "executeTakeFirst", or "executeTakeFirstOrThrow".
 * ------------------------------------------------------------------------------------------------------------------ */

/** Adds a wait before next commands are executed. */
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 *
 * @param fn The function to retry.
 * @returns
 */
async function retry<T>(fn: () => Promise<T>) {
  const log = getLogger();
  let [attempt, maxAttempts] = [0, 10];

  let error: unknown;
  do {
    try {
      return await fn();
    } catch (e) {
      error = e;
      const isConnectionIssue = z
        .object({ code: z.enum(["ECONNRESET", "EPIPE", "ETIMEDOUT"]) })
        .or(z.object({ type: z.literal("ClosedError") }))
        .nullable()
        .catch(null)
        .transform((val) => !!val)
        .parse(e);

      // reset the connection if there was a connection issue
      if (isConnectionIssue) {
        log.warn(e, `Caught a database connection error, retrying attempt ${attempt + 1}/${maxAttempts} ...`);
        await global.__sqlClient?.destroy().finally(() => (global.__sqlClient = null));
        await delay(5 ** attempt); // backoff calling function again exponentially
        attempt = attempt + 1;
      } else throw e;
    }
  } while (attempt < maxAttempts);

  // throw the error if number of retries has failed
  throw error;
}

/**
 * Executes a kysely command with exponential backoff and retries for database connection failures. This should be used
 * for all queries to the SQL database as underlying connection socket may close unexpectedly. In these situations we
 * will attempt to run the query again after making a new connection.
 *
 * @param cmd The Kysely command to run.
 * @returns
 */
export async function execute<T, C extends Compilable<T> | CompiledQuery<T>>(cmd: C): Promise<InferResult<C>> {
  let command = "compile" in cmd ? cmd.compile() : (cmd as CompiledQuery<T>);

  async function fn() {
    switch (command.query.kind) {
      case "DeleteQueryNode":
      case "UpdateQueryNode":
      case "InsertQueryNode": {
        if (command.query.returning)
          return sqldb()
            .executeQuery(command)
            .then(({ rows }) => rows as InferResult<C>);
        else return sqldb().executeQuery(command) as any as Promise<InferResult<C>>;
      }
      case "SelectQueryNode": {
        return sqldb()
          .executeQuery(command)
          .then(({ rows }) => rows as InferResult<C>);
      }
      default: {
        return sqldb().executeQuery(command) as any as Promise<InferResult<C>>;
      }
    }
  }

  return retry(fn);
}

/**
 * This function is a helper that can be run on the results of an 'execute' call to extract the first item from an
 * array of results. If an item isn't found, then 'undefined' will be returned.
 *
 * @param input The result of 'execute'.
 * @returns The first element of an 'execute' or undefined.
 */
export function takeFirst<T>(input: (T | undefined)[]) {
  const [result] = input;
  return result;
}

/**
 * This function is a helper that can be run on the results of an 'execute' call to extract the first item from an
 * array of results. If an item isn't found, then and error will be thrown.
 *
 * @param input The result of an 'execute'.
 * @returns The first element of an 'execute'.
 */
export function takeFirstOrThrow<T>(input: (T | undefined)[]) {
  const [result] = input;
  if (result === undefined) throw new Error("No result was found for the query.");
  return result;
}
/* ------------------------------------------------------------------------------------------------------------------
 * Shared Zod Helpers
 * ------------------------------------------------------------------------------------------------------------------ */
export const ZPublicSession = ZSession.pick({
  user_id: true,
  username: true,
  name: true,
  avatar_url: true,
  github_url: true,
  roles: true,
});

export type IPublicSession = z.infer<typeof ZPublicSession>;
