import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { db, getLogger } from "~/util/server";
import { randomUUID } from "crypto";
import { ZEnv } from "~/util";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const logger = getLogger();
  const env = ZEnv.parse(process.env);

  // if a 'redirect_uri' was specified in the request, capture it
  const search = new URL(request.url).searchParams;
  const redirect_uri = search.get("redirect_uri") ?? "/";

  // create a state code
  logger.info({ traceId: "7561cb47" }, "Creating the oauth_state_code in the database ...");
  const stateCode = await db
    .insertInto("oauth_state_codes")
    .values({ id: randomUUID(), redirect_uri })
    .returningAll()
    .executeTakeFirstOrThrow();
  logger.info({ traceId: "202de58e" }, "Success: Created the oauth_state_code in the database.");

  // build the Github OAuth URL
  const githubUrl = new URL("https://github.com/login/oauth/authorize");
  githubUrl.searchParams.append("client_id", env.GITHUB_CLIENT_ID);
  githubUrl.searchParams.append("redirect_uri", new URL("/auth/callback/github", env.SITE_URL).toString());
  githubUrl.searchParams.append("scope", "user");
  githubUrl.searchParams.append("state", stateCode.id);

  return redirect(githubUrl.toString());
};
