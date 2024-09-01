import { createCookie, createSession, createSessionStorage } from "@remix-run/node";
import { ZEnv } from "~/util/env";
// @ts-ignore
import ms from "ms";
import { createTypedCookie } from "remix-utils/typed-cookie";
import { z } from "zod";
import { db } from "~/util/server";

// -------------------------------------------------------------------------------------
// Create the User Session
// -------------------------------------------------------------------------------------
// This is the main session ttoken that is responsible for authorization.
// -------------------------------------------------------------------------------------

// define constants
export const MAX_SESSION_AGE = "90d";
export const SESSION_KEY = "__session";

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

export const ZCreateSession = z.object({
  id: z.string(),
  user_id: z.string(),
  roles: z.array(z.string()).nullable(),
  expires_at: z.string(),
  created_at: z.string(),
  modified_at: z.string(),
});
export const session = createSessionStorage({
  cookie: sessionCookie,
  async createData(data, expires) {
    return "yo";
  },
  async readData(id) {
    return ZCreateSession.parse(id);
  },
  async updateData(id, data, expires) {},
  async deleteData(id) {},
});
