import { createCookie } from "~/lib/custom-cookie";
import { createTypedCookie } from "remix-utils/typed-cookie";
import { z } from "zod";
// @ts-ignore
import ms from "ms";
import { ZEnv } from "~/util";
import { getLogger } from "./logger";
import { db, SessionSecretsTable } from "./libsql";
import { Selectable, sql } from "kysely";
import { randomBytes } from "crypto";

// -------------------------------------------------------------------------------------
// Define Application Cookies
// -------------------------------------------------------------------------------------

const PortPattern = /\:d+$/;
export const preferences = createTypedCookie({
  cookie: createCookie("__preferences", {
    // Lifetime
    // --------
    // Ideally this would be infinite, however Chrome has a limit on the duration that a
    // cookie can last. This limit is 400 days. This limit applies to 'maxAge' as well
    // as 'expires'. If we used 'expires' we would need to specify the limit each time
    // the cookie is created. It's just easier to define the 'maxAge' once in this
    // configuration and not worry about the lifetime when using this module.
    //
    // See the limits blog post: https://developer.chrome.com/blog/cookie-max-age-expires/
    maxAge: ms("400d"),

    // Restrict Access
    // ---------------
    // The 'secure' attribute should be true as there is no instance where a user should
    // access this site without https protocol, however Safari will not allow javascript
    // to set cookies with 'secure'. For consistency set this value to 'false'. The
    // 'httpOnly' should be false as we want the client to be able to access this cookie
    // to read the user's preferences.
    secure: false,
    httpOnly: false,

    // Where/When Cookies are Sent
    // ---------------------------
    // Leaving the 'domain' attribute blank will default the cookie to being accessed by
    // the same domain that set it, but it will exclude subdomains. For this reason the
    // 'domain' attribute should be explicitly specified. The 'path' attribute should be
    // set to '/' so that all paths of the site can access this cookie. The 'sameSite'
    // attribute should be set to 'lax' as we want the cookies to be sent when navigating
    // to our site from other sites or else we will have flash issues.
    domain: new URL(ZEnv.parse(process.env).SITE_URL).hostname.replace(PortPattern, ""),
    path: "/",
    sameSite: "lax",
  }),
  schema: z.object({ _theme: z.enum(["light", "dark"]), _codeTheme: z.enum(["light", "dark"]) }).nullable(),
});

const MAX_SESSION_AGE = "90d";
export const session = createTypedCookie({
  cookie: createCookie("__session", {
    // Lifetime
    // --------
    // Using the 'maxAge' attribute allows us to set a cookies max age relative to when
    // it is created by the browser. If we use the 'expires' attribute here, it would be
    // pointless as each time a new session cookie is created we would need to pass in a
    // new time.
    //
    // NOTE: The value supplied here will not be used in this application, the maxAge
    // will be determined by the database when a new session is created or updated.
    maxAge: ms(MAX_SESSION_AGE) / 1000,

    // Restrict Access
    // ---------------
    // The 'secure' attribute should always be true as there is no instance where a user
    // should access this site without https protocol. The 'httpOnly' should be true as
    // we do not want client side javascript to be able to access this session cookie to
    // prevent XSS attacks.
    secure: true,
    httpOnly: true,

    // Where/When Cookies are Sent
    // ---------------------------
    // Leaving the 'domain' attribute blank will default the cookie to being accessed by
    // the same domain that set it, but it will exclude subdomains. For this reason the
    // 'domain' attribute should be explicitly specified. The 'path' attribute should be
    // set to '/' so that all paths of the site can access this cookie. The 'sameSite'
    // attribute should be set to 'lax' as we want the cookies to be sent when navigating
    // to our site from other sites or else users will appear briefly to be signed out.
    domain: new URL(ZEnv.parse(process.env).SITE_URL).hostname.replace(/\:d+$/, ""),
    path: "/",
    sameSite: "lax",

    // Secrets for Signing
    // -------------------
    // The 'secrets' attribute is a function that returns an array of strings that are
    // used to sign the session cookie. Signing the session cookie is used to prevent
    // tampering with the cookie. The server will also reject checking the session if
    // the cookie is not signed with one of the secrets, this prevents attacks where an
    // actor might spam the server with fake session cookies.
    secrets: getSecrets,
  }),
  schema: z.string().nullable(),
});

export const ZFlashMessage = z.object({
  type: z.string(),
  title: z.string(),
  message: z.string(),
  id: z.string(),
});
export const flash = createTypedCookie({
  cookie: createCookie("__flash", {
    // Lifetime
    // --------
    // Flash cookies are meant to be short lived, they are used to store messages that
    // are meant to be displayed to the user once. The 'maxAge' should be set to a
    // reasonable time for the user to see the message, but not so long that the message
    // becomes irrelevant.
    maxAge: ms("1h"),

    // Restrict Access
    // ---------------
    // The 'secure' attribute should be true as there is no instance where a user should
    // access this site without https protocol, however Safari will not allow javascript
    // to set cookies with 'secure'. For consistency set this value to 'false'. The
    // 'httpOnly' should be false as we want the client to be able to access this cookie
    // to read the user's preferences.
    secure: false,
    httpOnly: false,

    // Where/When Cookies are Sent
    // ---------------------------
    // Leaving the 'domain' attribute blank will default the cookie to being accessed by
    // the same domain that set it, but it will exclude subdomains. For this reason the
    // 'domain' attribute should be explicitly specified. The flash message is only used
    // by the main site (not subdomains) so we will leave this blank. The 'sameSite'
    // attribute should be set to 'lax' as we want the cookies to be sent when navigating
    // to our site from other sites.
    // domain: new URL(ZEnv.parse(process.env).SITE_URL).hostname.replace(PortPattern, ""),
    path: "/",
    sameSite: "lax",
  }),
  schema: z.object({ globalMessage: ZFlashMessage.optional() }).nullable(),
});

// -------------------------------------------------------------------------------------
// Define the Secrets Function
// -------------------------------------------------------------------------------------
let __cachedSecrets: Selectable<SessionSecretsTable>[] = [];

/**
 * This function returns the secrets used to sign cookies.
 *
 * This function will first check if there are any in-memory cached secrets that are
 * still active. If there are, it will return those secrets. If there are no active
 * secrets in the cache, it will query the database for all unexpired secrets. If there
 * is an active secret in the unexpired secrets it will cache all of the unexpired
 * secrets and return them. If there are no active secrets in the unexpired secrets, it
 * will create a new secret, cache it and all of the unexpired secrets, and return them.
 *
 * @returns The secrets used to sign cookies.
 */
async function getSecrets() {
  const logger = getLogger();

  const cacheHasActiveSecret = __cachedSecrets.some((secret) => secret.expires_at > new Date().toISOString());
  if (cacheHasActiveSecret) {
    logger.debug({ traceId: "91442e08" }, "Cache has active secrets, returning them.");
    return __cachedSecrets.map((secret) => secret.id);
  } else {
    logger.info({ traceId: "40e1384f" }, "Retrieving unexpired secrets from the database ...");
    const unexpiredSecrets = await db
      .selectFrom("session_secrets")
      .selectAll()
      .where("expires_at", ">", sql<string>`(datetime('now'))`)
      .orderBy("created_at", "desc")
      .execute();

    const dbHasActiveSecret = unexpiredSecrets.some((secret) => secret.inactive_at > new Date().toISOString());
    if (dbHasActiveSecret) {
      logger.info({ traceId: "c2601916" }, "Active secrets found in the database, caching and returning them.");
      __cachedSecrets = unexpiredSecrets;
      return __cachedSecrets.map((secret) => secret.id);
    } else {
      logger.info({ traceId: "fc8600ec" }, "No active secrets found in the database, creating one ...");
      const newSecret = await db
        .insertInto("session_secrets")
        .values({ id: randomBytes(16).toString("hex") }) // Using at least 32 characters.
        .returningAll()
        .executeTakeFirstOrThrow();

      logger.info({ traceId: "8bacd4b9" }, "Created a new secret, caching and returning all secrets.");
      __cachedSecrets = [newSecret, ...unexpiredSecrets];
      return __cachedSecrets.map((secret) => secret.id);
    }
  }
}
