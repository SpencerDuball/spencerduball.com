import { type ActionFunctionArgs } from "@remix-run/node";
import { flashCookie, sessionCookie } from "~/lib/util/sessions.server";
import { ddb, logger } from "~/lib/util/globals.server";
import { getSessionInfo } from "~/lib/util/utils.server";

export async function action({ request }: ActionFunctionArgs) {
  const log = logger(request);

  switch (request.method) {
    case "POST": {
      // Sign User Out
      // -------------
      // Get the session info from the database from the session cookie. If the session doesn't exist in the database
      // only send a Set-Cookie header to remove the cookie client-side. If the session does exist, first delete the
      // session in the database and then return the Set-Cookie header.
      const deleteCookie = await sessionCookie.serialize("", { maxAge: 0 });
      const session = await getSessionInfo(request);
      if (session) {
        log.info("Deleting the session from the database ...");
        await ddb()
          .entities.session.delete({ pk: session.pk, sk: session.sk })
          .catch(async (e) => log.error(e, "Failure: There was an issue deleting the session from the database."));
        log.info("Success: Deleted the session from the database.");
      }

      log.info("Responding with Set-Cookie to delete session from browser.");
      const flash = await flashCookie.serialize({
        type: "success",
        placement: "top",
        title: "Signed Out",
        description: "You have successfully been signed out.",
        duration: 5000,
      });
      return new Response(null, {
        status: 200,
        headers: [
          ["Set-Cookie", deleteCookie],
          ["Set-Cookie", flash],
        ],
      });
    }
    default: {
      log.info("This method is not allowed, only POST is defined.");
      throw new Response(null, { status: 405, statusText: "Method Not Allowed" });
    }
  }
}
