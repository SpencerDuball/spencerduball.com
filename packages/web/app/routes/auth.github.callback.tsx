import { redirect, createSession } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { getDdbClient, getLogger, getSsmValue, ZEnv, getPgClient, logRequest } from "~/lib/util.server";
import { ZOAuthStateCode } from "@spencerduballcom/db/ddb";
import axios from "axios";
import { z } from "zod";
import ms from "ms";
import { commitSession } from "~/lib/session.server";
import { authMocks } from "~/mocks/auth.server";

const ZCodeSearchParam = z.object({ id: z.string(), redirectUri: z.string().optional() });
const ZAccessTokenRes = z.object({ access_token: z.string(), scope: z.string(), token_type: z.string() });
const ZGithubUserInfo = z.object({
  login: z.string(),
  id: z.number(),
  name: z.string(),
  avatar_url: z.string(),
  html_url: z.string(),
});

export const loader = async ({ request }: LoaderArgs) => {
  await logRequest(request);

  const reqUrl = new URL(request.url);
  const search = new URLSearchParams(reqUrl.search);

  // get the utilities
  const logger = getLogger();
  const ddb = await getDdbClient();
  const db = await getPgClient();
  const env = ZEnv.parse(process.env);

  // setup mocks if not in prod
  if (env.STAGE !== "prod") {
    logger.info("Setting up mocks ...");
    authMocks();
    logger.info("Success: Set up mocks.");
  }

  // check for requisite search params
  logger.info("Checking that request has requisite search parameters supplied ...");
  if (!search.has("state") || !search.has("code")) {
    logger.error("Search parameters 'state' and 'code' are not being returned from Github.");
    throw redirect("/");
  }
  logger.info("Success: The request format is valid.");

  // get the oauth_state_code record from the ddb table
  logger.info("Querying the database for the stored oauth_state_code ...");
  const state = await ZCodeSearchParam.parseAsync(JSON.parse(search.get("state")!)).catch((e) => {
    logger.error("Search parameter 'state' did not match the expected output.");
    logger.error(e);
    throw redirect("/");
  });
  const stateCode = await ddb.entities.oauthStateCode
    .get({ pk: `oauth_state_code#${state.id}`, sk: `oauth_state_code#${state.id}` })
    .catch((e) => {
      logger.error("There was an issue querying the database.");
      logger.error(e);
      throw redirect("/");
    })
    .then(async ({ Item }) => {
      if (!Item) {
        logger.warn("oauth_state_code did not exist.");
        throw redirect("/");
      }
      return ZOAuthStateCode.parseAsync(Item).catch((e) => {
        logger.error("The oauth_state_code did not match the expected output.");
        logger.error(e);
        throw redirect("/");
      });
    });
  logger.info("Success: Retrieved the oauth_state_code from the database.");

  // ensure the stateCode record matches the returned state
  logger.info("Checking that the oauth_state_code matches the supplied oauth_state_code parameter ...");
  if (!(stateCode.code === search.get("state"))) {
    logger.warn("oauth_state_code from the database did not match the oauth_state_code form the callback.");
    throw redirect("/");
  }
  logger.info("Success: The oauth_state_codes match.");

  // request access_token from github on behalf of the user
  logger.info("Requesting access_token from Github on behalf of the user ...");
  let client_id = "GITHUB_CLIENT_ID_MOCK";
  let client_secret = "GITHUB_CLIENT_SECRET_MOCK";
  if (env.STAGE === "prod") {
    client_id = await getSsmValue(env.GITHUB_CLIENT_ID_PATH, true);
    client_secret = await getSsmValue(env.GITHUB_CLIENT_SECRET_PATH, true);
  }
  const post = { client_id, client_secret, code: search.get("code") };
  const { access_token, token_type } = await axios
    .post("https://github.com/login/oauth/access_token", post, { headers: { Accept: "application/json" } })
    .catch((e) => {
      logger.error("There was an issue querying the database.");
      logger.error(e);
      throw redirect("/");
    })
    .then(async (res) => ZAccessTokenRes.parseAsync(res.data))
    .catch((e) => {
      console.warn("Failed to retrieve Github response.");
      console.warn(e);
      throw redirect("/");
    });
  logger.info("Success: Received the access_token from Github.");

  // get the userinfo from github
  logger.info("Requesting the userinfo from Github ...");
  const userInfo = await axios
    .get("https://api.github.com/user", { headers: { Authorization: `${token_type} ${access_token}` } })
    .catch((e) => {
      logger.error("There was an error retrieving the userinfo from Github.");
      logger.error(e);
      throw redirect("/");
    })
    .then(({ data }) =>
      ZGithubUserInfo.parseAsync(data).catch((e) => {
        logger.error("Github userinfo did not match the expected output.");
        logger.error(e);
        throw redirect("/");
      })
    )
    .then(({ id, login: username, name, avatar_url, html_url: github_url }) => ({
      id,
      username,
      name,
      avatar_url,
      github_url,
    }));
  logger.info("Success: Received the userinfo from Github.");

  // update the user in our database with the fresh github info, or create them if they don't exist
  logger.info("Retrieving/Creating the user from our database ...");
  const user = await db
    .updateTable("users")
    .where("id", "=", userInfo.id)
    .set({ ...userInfo, modified_at: new Date() })
    .returningAll()
    .executeTakeFirstOrThrow()
    .catch(async () => {
      // create the user if they don't exist
      return db
        .insertInto("users")
        .values({ ...userInfo, created_at: new Date(), modified_at: new Date() })
        .returningAll()
        .executeTakeFirstOrThrow();
    })
    .catch((e) => {
      logger.error("There was an issue connecting to the database.");
      logger.error(e);
      throw redirect("/");
    });
  logger.info("Success: Updated/Created the user in the database.");

  // retrieve the roles for the user
  logger.info("Retrieving the user roles from our database ...");
  const roles = await db
    .selectFrom("user_roles")
    .selectAll()
    .where("user_roles.user_id", "=", user.id)
    .execute()
    .catch((e) => {
      logger.error("Error retrieving the roles for the user.");
      logger.error(e);
      throw e;
    });
  logger.info("Success: Retrieved the user roles from the database.");

  // create the user session
  logger.info("Creating the user session in the database ...");
  const [expires, secure] = [new Date(Date.now() + ms("90d")), reqUrl.hostname === "localhost" ? false : true];
  const session = createSession({
    userId: user.id,
    username: user.username,
    name: user.name,
    avatarUrl: user.avatar_url,
    githubUrl: user.github_url,
    roles: roles.map((role) => role.role_id),
  });
  const cookie = await commitSession(session, { expires, secure });
  logger.info("Success: Created the user session in the database.");

  return redirect(state.redirectUri ? state.redirectUri : "/", { headers: { "Set-Cookie": cookie } });
};
