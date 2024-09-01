import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { ZEnv } from "~/util";
import { getLogger } from "~/util/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const logger = getLogger();
  const env = ZEnv.parse(process.env);

  // extract the Authorization header
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    logger.error("No Authorization header found in the request.");
    return new Response("Unauthorized", { status: 401 });
  }

  // ensure the Bearer token is valid
  const token = authHeader.match(/Bearer\s+(?<token>\w+)/i);
  if (!token) {
    logger.error("Invalid Authorization header found in the request.");
    return new Response("Unauthorized", { status: 401 });
  } else if (token.groups?.token !== env.CRON_CLIENT_SECRET) {
    logger.error("Invalid Bearer token found in the request.");
    return new Response("Unauthorized", { status: 401 });
  }

  return json({ message: "Success: The cron.daily route was accessed." });
};
