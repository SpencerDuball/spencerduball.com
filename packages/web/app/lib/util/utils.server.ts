import { redirect } from "@remix-run/node";
import { ZSession } from "@spencerduballcom/db/ddb";
import { getSession } from "~/lib/session.server";

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
