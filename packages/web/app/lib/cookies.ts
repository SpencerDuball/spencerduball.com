import { createCookie } from "@remix-run/node";
import { createTypedCookie } from "remix-utils/typed-cookie";
import { z } from "zod";
// TODO: The @ts-ignore can be removed after the ms@3 is released. This is caused because of this bug:
// https://github.com/vercel/ms/pull/191
// @ts-ignore
import ms from "ms";
import { Config } from "sst/node/config";

export const preferences = createTypedCookie({
  cookie: createCookie("__preferences", {
    // Lifetime
    // --------
    // Ideally this would be infinite, however Chrome has a limit on the duration that a cookie can last. This limit is
    // 400 days. This limit applies to 'maxAge' as well as 'expires'. If we used 'expires' we would need to specify the
    // limit each time the cookie is created. It's just easier to define the 'maxAge' once in this configuration and
    // not worry about the lifetime when using this module.
    // See the limits blog post: https://developer.chrome.com/blog/cookie-max-age-expires/
    maxAge: ms("400d"),

    // Restrict Access
    // ---------------
    // The 'secure' attribute should be true as there is no instance where a user should access this site without https
    // protocol, however Safari will not allow javascript to set cookies with 'secure'. For consistency set this value
    // to 'false'. The 'httpOnly' should be false as we want the client to be able to access this cookie to read the
    // user's preferences.
    secure: false,
    httpOnly: false,

    // Where/When Cookies are Sent
    // ---------------------------
    // Leaving the 'domain' attribute blank will default the cookie to being accessed by the same domain that set it,
    // but it will exclude subdomains. For this reason the 'domain' attribute should be explicitly specified.
    // The 'path' attribute should be set to '/' so that all paths of the site can access this cookie.
    // The 'sameSite' attribute should be set to 'lax' as we want the cookies to be sent when navigating to our site
    // from other sites or else we will have flash issues.
    domain: new URL(Config.SITE_URL).hostname.replace(/\:d+$/, ""),
    path: "/",
    sameSite: "lax",
  }),
  schema: z.object({ theme: z.enum(["light", "dark"]) }).nullable(),
});
