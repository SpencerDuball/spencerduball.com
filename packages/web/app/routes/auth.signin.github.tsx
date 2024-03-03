import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { ZOAuthStateCode } from "@spencerduballcom/db/ddb";
import { Config } from "sst/node/config";
import { ZodError } from "zod";
import { ddb, logger } from "~/lib/util/globals.server";
import { flash500 } from "~/lib/util/utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const log = logger(request);

  // if a 'redirect_uri' was specified in the request, capture it
  const search = new URL(request.url).searchParams;
  const redirect_uri = search.has("redirect_uri") ? search.get("redirect_uri")! : "/";

  // create a state code
  log.info("Creating the oauth_state_code in the database ...");
  const stateCode = await ddb()
    .entities.oauthStateCode.update({ redirect_uri }, { returnValues: "ALL_NEW" })
    .then(async ({ Attributes }) => ZOAuthStateCode.parseAsync(Attributes))
    .catch(async (e) => {
      if (e instanceof ZodError) {
        log.error(e, "The oauth_state_code did not match the expected output.");
        throw redirect(redirect_uri, { headers: [["Set-Cookie", await flash500]] });
      }
      log.error(e, "There was an issue writing to the database.");
      throw redirect(redirect_uri, { headers: [["Set-Cookie", await flash500]] });
    });
  log.info("Success: Created the oauth_state_code.");

  // Collect Search Parameters
  // -------------------------
  const params = new URLSearchParams();
  params.append("client_id", Config.GITHUB_CLIENT_ID);
  params.append(
    "redirect_uri",
    Config.MOCKS_ENABLED === "TRUE" ? "/auth/callback/github" : `${Config.SITE_URL}/auth/callback/github`,
  );
  params.append("scope", "user");
  params.append("state", stateCode.code);

  // redirect to authorize with github
  // ---------------------------------
  // If MOCKS_ENABLED then we want to redirect instead to the mocked Github service. This is helpful for testing
  // and allows local dev and even staging environments to assume roles.
  const authorizePath =
    Config.MOCKS_ENABLED === "TRUE" ? `/mock/github/login/oauth/authorize` : `https://github.com/login/oauth/authorize`;

  log.info(`Redirecting to ${authorizePath}?${params.toString()}`);
  return redirect(`${authorizePath}?${params.toString()}`);
};
