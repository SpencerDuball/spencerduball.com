import { redirect } from "@remix-run/node";
import { ZSession } from "@spencerduballcom/db/ddb";
import { flashCookie, session } from "~/lib/util/sessions.server";
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
