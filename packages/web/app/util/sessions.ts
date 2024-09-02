import { createCookie } from "@remix-run/node";
import { ZEnv } from "~/util/env";
// @ts-ignore
import ms from "ms";
import { createTypedCookie } from "remix-utils/typed-cookie";
import { z } from "zod";
import { db, SessionsTable } from "~/util/server";
import { Insertable } from "kysely";

// -------------------------------------------------------------------------------------
// Create the User Session
// -------------------------------------------------------------------------------------
// This is the main session ttoken that is responsible for authorization.
// -------------------------------------------------------------------------------------

// define constants
const MAX_SESSION_AGE = "90d";
const SESSION_KEY = "__session";

const _sessionCookie = createCookie(SESSION_KEY, {
  // Lifetime
  // --------
  // Using the 'maxAge' attribute allows us to set a cookies max age relative to when it is created by the browser.
  // If we use the 'expires' attribute here, it would be pointless as each time a new session cookie is created we
  // would need to pass in a new time.
  maxAge: ms(MAX_SESSION_AGE) / 1000,

  // Restrict Access
  // ---------------
  // The 'secure' attribute should always be true as there is no instance where a user should access this site without
  // https protocol. The 'httpOnly' should be true as we do not want client side javascript to be able to access this
  // session cookie to prevent XSS attacks.
  secure: true,
  httpOnly: true,

  // Where/When Cookies are Sent
  // ---------------------------
  // Leaving the 'domain' attribute blank will default the cookie to being accessed by the same domain that set it,
  // but it will exclude subdomains. For this reason the 'domain' attribute should be explicitly specified.
  // The 'path' attribute should be set to '/' so that all paths of the site can access this cookie.
  // The 'sameSite' attribute should be set to 'lax' as we want the cookies to be sent when navigating to our site
  // from other sites or else users will appear briefly to be signed out.
  domain: new URL(ZEnv.parse(process.env).SITE_URL).hostname.replace(/\:d+$/, ""),
  path: "/",
  sameSite: "lax",
});
const ZSessionCookie = z.string().nullable();
export const sessionCookie = createTypedCookie({ cookie: _sessionCookie, schema: ZSessionCookie });

// -------------------------------------------------------------------------------------
// Create Functions for Session Secrets
// -------------------------------------------------------------------------------------

export class UserSession {
  /**
   * Creates a new session for the user and returns a "Set-Cookie" header.
   */
  async create(userId: Insertable<SessionsTable>["user_id"]) {}
  /**
   * Refreshes the session expiration for the user and returns a "Set-Cookie" header.
   */
  async refresh(id: Insertable<SessionsTable>["id"]) {}
  /**
   * Deletes the session for the user and returns a "Set-Cookie" header.
   */
  async delete(id: Insertable<SessionsTable>["id"]) {}
  /**
   * Retrieves the session for the user.
   *
   * This function will parse the cookie header, extract the session id from the cookie,
   * query the database for the session, and return the session.
   *
   * @param cookie The cookie header from the request.
   */
  async get(cookie: string | null) {}
}
