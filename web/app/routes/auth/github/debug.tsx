import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { sessionCookie } from "~/cookies.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await sessionCookie.serialize("12345", { domain: new URL(request.url).origin });

  return json({ session });
};
