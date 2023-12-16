import { Config } from "sst/node/config";
import { createCookie, createSessionStorage, json } from "@remix-run/node";
import { createTypedCookie } from "remix-utils/typed-cookie";
import { createTypedSessionStorage } from "remix-utils/typed-session";
import { ZSession } from "@spencerduballcom/db/ddb";
import { ddb } from "~/lib/util/utilities.server";
// TODO: The @ts-ignore can be removed after the ms@3 is released. This is caused because of this bug:
// https://github.com/vercel/ms/pull/191
// @ts-ignore
import ms from "ms";
import { ZodError, z } from "zod";

export const MAX_AGE = "90d" as const;

// Define the Session Cookie
// -------------------------
const _sessionCookie = createCookie("__session", {
  // Lifetime
  // --------
  // Using the 'maxAge' attribute allows us to set a cookies max age relative to when it is created by the browser.
  // If we use the 'expires' attribute here, it would be pointless as each time a new session cookie is created we
  // would need to pass in a new time.
  maxAge: ms(MAX_AGE) / 1000,

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
  domain: new URL(Config.SITE_URL).hostname.replace(/\:d+$/, ""),
  path: "/",
  sameSite: "lax",
});
const ZSessionCookie = z.string().nullable();
export const sessionCookie = createTypedCookie({ cookie: _sessionCookie, schema: ZSessionCookie });

// Define the Session Store
// ------------------------
export const ZCreateSession = z.object({
  user_id: z.number(),
  username: z.string(),
  name: z.string(),
  avatar_url: z.string().optional(),
  github_url: z.string(),
  roles: z.string().array(),
});
const { getSession, commitSession, destroySession } = createSessionStorage({
  cookie: sessionCookie,
  async createData(data, expires) {
    // ensure the passed in data is valid to create the ddb session item
    const input = ZCreateSession.parse(data);

    // ensure expires is valid
    const ttl = expires
      ? Math.round(expires.getTime() / 1000)
      : Math.round((new Date().getTime() + ms(MAX_AGE)) / 1000);

    // create the user session
    const session = await ddb()
      .entities.session.update({ ...input, ttl }, { returnValues: "ALL_NEW" })
      .then(({ Attributes }) => ZSession.parse(Attributes));

    return session.id;
  },
  async readData(id) {
    // get the session info
    const session = await ddb()
      .entities.session.get({ pk: `session#${id}`, sk: `session#${id}` })
      .then(({ Item }) => ZSession.parse(Item));

    // check that the session isn't expired
    const timeInSeconds = new Date().getTime() / 1000;
    if (session.ttl >= timeInSeconds) return session;
    else return null;
  },
  async updateData(id, data, expires) {
    // update the session data
    const ttl = expires
      ? Math.round(expires.getTime() / 1000)
      : Math.round((new Date().getTime() + ms(MAX_AGE)) / 1000);
    await ddb().entities.session.update({ ...ZSession.parse(data), ttl, pk: `session#${id}`, sk: `session#${id}` });
  },
  async deleteData(id) {
    await ddb().entities.session.delete({ pk: `session#${id}`, sk: `session#${id}` });
  },
});

export { getSession, commitSession, destroySession };
