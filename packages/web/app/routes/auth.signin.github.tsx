import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { ZOAuthStateCode } from "@spencerduballcom/db/ddb";
import { Config } from "sst/node/config";
import { ddb, logger, logRequest } from "~/lib/util/utilities.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await logRequest(request);

  // if a 'redirect_uri' was specified in the request, capture it
  const search = new URL(request.url).searchParams;
  const redirect_uri = search.has("redirect_uri") ? search.get("redirect_uri")! : "/";

  // create a state code
  logger().info("Creating the oauth_state_code in the database ...");
  const stateCode = await ddb()
    .entities.oauthStateCode.update({ redirect_uri }, { returnValues: "ALL_NEW" })
    .catch((e) => {
      logger().error("There was an issue querying the database.");
      logger().error(e);
      throw redirect(redirect_uri);
    })
    .then(async ({ Attributes }) =>
      ZOAuthStateCode.parseAsync(Attributes).catch((e) => {
        logger().error("The oauth_state_code did not match the expected output.");
        logger().error(e);
        throw redirect(redirect_uri);
      })
    );
  logger().info("Success: Created the oauth_state_code.");

  // collect the oauth search parameters
  const params = new URLSearchParams();
  params.append("client_id", Config.GITHUB_CLIENT_ID);
  params.append("redirect_uri", Config.SITE_URL);
  params.append("scope", "user");
  params.append("state", stateCode.code);

  // redirect to authorize with github
  const authorizePath =
    Config.MOCKS_ENABLED === "TRUE" ? `/mock/github/login/oauth/authorize` : `https://github.com/login/oauth/authorize`;
  return redirect(`${authorizePath}?${params.toString()}`);
};
