import { type LoaderFunctionArgs, redirect, json } from "@remix-run/node";
import { ZOAuthStateCode } from "@spencerduballcom/db/ddb";
import { z } from "zod";
import { ZJsonString } from "~/lib/util/client";
import { ddb, logger, logRequest } from "~/lib/util/utilities.server";
import { Config } from "sst/node/config";
import axios from "axios";

const ZSearch = z.object({
  state: ZJsonString.pipe(z.object({ id: z.string(), redirect_uri: z.string() })),
  code: z.string(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const log = logger();
  await logRequest(log, request);

  // Ensure Required Search Params
  // -----------------------------
  // This route should only ever be called from Github or the Github Mock.
  let search: z.infer<typeof ZSearch>;
  try {
    log.info("Parsing the search parameters ...");
    const url = new URL(request.url);
    search = ZSearch.parse(Object.fromEntries(new URLSearchParams(url.search)));
    log.info("Success: Parsed the search parameters successfully.");
  } catch (e) {
    log.info(e, "Failure: Required search params are not present.");
    try {
      const url = new URL(request.url);
      const { redirect_uri } = ZSearch.shape.state.parse(url.searchParams.get("state"));
      throw redirect(redirect_uri);
    } catch (e) {}
    throw redirect("/");
  }

  // Confirm OAuth State Code Matches
  // --------------------------------
  // An OAuth State Code was generated and stored in the database when we first clicked the signin button. Confirm
  // that the code returned from Github matches the one stored in the database. If not, then it's possible there is
  // a CSRF attack.
  // (1) Retrieve the oauth_state_code
  log.info("Retrieving the oauth_state_code from the database ...");
  const oauthStateCode = await ddb()
    .entities.oauthOTC.get({ pk: `oauth_state_code#${search.state.id}`, sk: `oauth_state_code#${search.state.id}` })
    .catch((e) => {
      log.error(e, "Failure: There was an issue querying the database.");
      throw json({ message: "Oops! Looks like an error from our end." }, { status: 500 });
    })
    .then(async ({ Item }) => {
      if (!Item) {
        log.info("Failure: The oauth_state_code did not exist in the database.");
        throw redirect(search.state.redirect_uri);
      } else {
        return ZOAuthStateCode.parseAsync(Item).catch((e) => {
          log.error(e, "Failure: The oauth_state_code did not match the expected output.");
          throw redirect(search.state.redirect_uri);
        });
      }
    });
  log.info("Success: Retrieved the oauth_state_code from the database.");

  // (2) Ensure the oauth_state_code matches the state from the search params.
  log.info("Validating the oauth_state_code matches ...");
  if (oauthStateCode.code !== JSON.stringify(search.state)) {
    log.info("Failure: The oauth_state_codes did not match.");
    throw redirect(search.state.redirect_uri);
  }

  // Request Access Token from Github on Behalf of User
  // --------------------------------------------------
  // Use the OTC from the search parameters in a request to Github in order to retrieve an access_token for the user.
  // This token will be used later to get the user info and confirm authenticate the user.
  const ZAccessTokenRes = z.object({ access_token: z.string(), scope: z.string(), token_type: z.string() });

  let accessTokenUrl: string;
  if (Config.MOCKS_ENABLED)
    accessTokenUrl = new URL("/mock/github/login/oauth/access_token?_data", Config.SITE_URL).href;
  else accessTokenUrl = "https://github.com/login/oauth/access_token";

  // retrieve the access_token
  log.info("Requesting access_token from Github ...");
  const accessTokenData = {
    client_id: Config.GITHUB_CLIENT_ID,
    client_secret: Config.GITHUB_CLIENT_SECRET,
    code: search.code,
  };
  const accessTokenFormData = new FormData();
  for (let [k, v] of Object.entries(accessTokenData)) accessTokenFormData.append(k, v);
  const { access_token, token_type } = await axios
    .post(accessTokenUrl, accessTokenFormData, {
      headers: { Accept: "application/json" },
    })
    .catch((e) => {
      log.info(e, "Failure: Request to Github failed.");
      throw redirect(search.state.redirect_uri);
    })
    .then(async ({ data }) => ZAccessTokenRes.parseAsync(data))
    .catch((e) => {
      log.error(e, "Failure: Response from Github did not match expected schema.");
      throw redirect(search.state.redirect_uri);
    });
  log.info("Success: Retrieved the access_token from Github.");

  // Get User Info From Github
  // -------------------------
  // To finish the authentication we need to know which user just authenticated with Github. We will ask Github for the
  // user info via the access_token which has just been retrieved in exchange for the OTC.
  const ZGithubUserInfo = z.object({
    login: z.string(),
    id: z.number(),
    name: z.string(),
    avatar_url: z.string(),
    html_url: z.string(),
  });

  let userInfoUrl: string;
  if (Config.MOCKS_ENABLED) userInfoUrl = new URL("/mock/api-github/user?_data", Config.SITE_URL).href;
  else userInfoUrl = "https://api.github.com/user";

  // retrieve the userinfo
  log.info("Requesting the userinfo from Github ...");
  const userInfo = await axios
    .get(userInfoUrl, { headers: { Authorization: `${token_type} ${access_token}` } })
    .catch((e) => {
      log.error(e, "Failure: There was an error retrieveing the userinfo from Github.");
      throw redirect(search.state.redirect_uri);
    })
    .then(({ data }) =>
      ZGithubUserInfo.parseAsync(data).catch((e) => {
        log.error(e, "Failure: Response from Github did not match expected schema.");
        throw redirect(search.state.redirect_uri);
      })
    )
    .then(({ id, login: username, name, avatar_url, html_url: github_url }) => ({
      id,
      username,
      name,
      avatar_url,
      github_url,
    }));
  log.info("Success: Retrieved the userinfo from Github.");

  log.info("LOOK MOM WE DID IT!");
  log.info(userInfo);
};
