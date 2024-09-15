import { ActionFunctionArgs, unstable_data as data } from "@remix-run/node";
import { getLogger, UserSession } from "~/util/server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const logger = getLogger();

  switch (request.method.toUpperCase()) {
    case "DELETE": {
      logger.info({ traceId: "23bf15bc" }, "Deleting user session ...");
      const session = await UserSession.parse(request.headers.get("cookie")).catch(() => null);
      const setCookieHeader = await UserSession.destroy(session?.id);
      logger.info({ traceId: "d82ae21e" }, "Success: Deleted user session.");

      return data(null, { headers: [["Set-Cookie", setCookieHeader]] });
    }
    default: {
      logger.info({ traceId: "cdcf6861" }, "This method is not allowed, only DELETE is defined.");
      return data(null);
    }
  }
};
