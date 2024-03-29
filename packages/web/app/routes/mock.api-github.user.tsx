import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { ddb, logger } from "~/lib/util/globals.server";
import { z } from "zod";
import { ZOAuthAccessToken, type OAuthAccessToken, MockGhUserType, ZMockGhUser } from "@spencerduballcom/db/ddb";
import { Config } from "sst/node/config";

const ZAuthorizationHeader = z.custom<`Bearer ${string}`>((val: any) => /^Bearer .+$/.test(val));

export async function loader({ request }: LoaderFunctionArgs) {
  const log = logger(request);

  // IMPORTANT!
  // ----------
  // If we are in a production environment, we do NOT want users to be able to access this mocked github oauth
  // endpoint. We want this page to be invisible to public users. Also if we are in any other environment that
  // does not have MOCKS_ENABLED we want to hide this page.
  if (Config.STAGE === "prod" || Config.MOCKS_ENABLED !== "TRUE") {
    if (Config.STAGE === "prod") log.info("In 'prod' environment, cannot use mocks here.");
    else log.info("Mocks are not enabled, check the MOCKS_ENABLED environment variable.");
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  // Ensure Required Authorization Header
  // ------------------------------------
  // The request should be called with a bearer token in the Authorization header. This bearer token needs to be the
  // access_token generated in '/mock/github/login/oauth/access_token'.
  let authorization: z.infer<typeof ZAuthorizationHeader>;
  try {
    log.info("Checking for 'Authorization' header ...");
    authorization = ZAuthorizationHeader.parse(request.headers.get("Authorization"));
    log.info("Success: The 'Authorization' header is of a valid schema.");
  } catch (e) {
    log.info(e, "Failure: The 'Authorization' header did not meet the schema.");
    return json({ message: "Valid access_token header was not passed." }, { status: 400 });
  }

  // Check Access Token Is Valid
  // ---------------------------
  const accessToken = authorization.split(" ")[1];
  let dbAccessToken: OAuthAccessToken;
  try {
    log.info("Retrieving access token from ddb ...");
    dbAccessToken = await ddb()
      .entities.oauthAccessToken.get({
        pk: `oauth_access_token#${accessToken}`,
        sk: `oauth_access_token#${accessToken}`,
      })
      .then(({ Item }) => ZOAuthAccessToken.parse(Item));
    log.info("Success: Retrieved acess_token from ddb.");
  } catch (e) {
    log.info(e, "Failure: Access token couldn't be retrieved from ddb.");
    return json({ message: "Access token didn't exist in the database." }, { status: 400 });
  }

  // Get User Info
  // -------------
  // Now that the access_token has been found, we can return the user info.
  let userInfo: MockGhUserType;
  try {
    log.info("Retrieving user info from ddb ...");
    userInfo = await ddb()
      .entities.mockGhUser.get({ pk: "mock_gh_user", sk: `mock_gh_user#${dbAccessToken.user_id}` })
      .then(({ Item }) => ZMockGhUser.parse(Item));
    log.info("Success: Retrieved user info from ddb.");
  } catch (e) {
    log.error(e, "Failure: User info couldn't be retrieved from ddb.");
    return json({ message: "User info could not be retrieved from db. " }, { status: 500 });
  }

  return json(userInfo);
}
