import { redirect } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { getDdbClient, getLogger, getSsmValue, ZEnv, logRequest } from "~/lib/util.server";
import { ZOAuthStateCode } from "@spencerduballcom/db/ddb";

export const loader = async ({ request }: LoaderArgs) => {
  await logRequest(request);

  const reqUrl = new URL(request.url);
  const search = new URLSearchParams(reqUrl.search);
  const returnLocation = search.has("redirect_uri") ? search.get("redirect_uri")! : "/";

  // get utilities
  const logger = getLogger();
  const ddb = await getDdbClient();
  const env = ZEnv.parse(process.env);

  // create a state code
  logger.info("Creating the oauth_state_code in the database ...");
  const stateCode = await ddb.entities.oauthStateCode
    .update({ redirectUri: returnLocation }, { returnValues: "ALL_NEW" })
    .catch((e) => {
      logger.error("There was an issue querying the database.");
      logger.error(e);
      throw redirect(returnLocation);
    })
    .then(async ({ Attributes }) =>
      ZOAuthStateCode.parseAsync(Attributes).catch((e) => {
        logger.error("The oauth_state_code did not matche the expected output.");
        logger.error(e);
        throw redirect(returnLocation);
      })
    );
  logger.info("Success: Created the oauth_state_code.");

  // build the oauth request url
  const url = new URL("https://github.com/login/oauth/authorize");
  if (env.STAGE === "prod") {
    url.searchParams.append("client_id", await getSsmValue(env.GITHUB_CLIENT_ID_PATH, true));
    url.searchParams.append("redirect_uri", (await getSsmValue(env.SITE_URL_PATH)) + "/auth/github/callback");
  } else {
    url.searchParams.append("client_id", "GITHUB_CLIENT_ID_MOCK");
    url.searchParams.append("redirect_uri", (await getSsmValue(env.SITE_URL_PATH)) + "/auth/github/callback");
  }
  url.searchParams.append("scope", "user");
  url.searchParams.append("state", stateCode.code);

  // send the request to github
  // --------------------------
  // If in production, we will send the request to github. If not in production, for example with dev or staging,
  // we will redirect to the mock for github. This allows us to assume roles for any user type we want easily,
  // allows for mocked users, and allows for integration testing that is desireable without hitting github.
  if (env.STAGE === "prod") return redirect(url.toString());
  else return redirect(`/auth/github/authorize-mock?${url.searchParams.toString()}`);
};
