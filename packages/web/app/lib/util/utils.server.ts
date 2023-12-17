import { redirect } from "@remix-run/node";
import { ZSession } from "@spencerduballcom/db/ddb";
import { getSession } from "~/lib/session.server";
import Cookie from "cookie";

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
  return await getSession(request.headers.get("cookie"))
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
