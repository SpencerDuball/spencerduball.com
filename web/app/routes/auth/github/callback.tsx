import type { LoaderFunction } from "@remix-run/node";
import { redirect, createSession } from "@remix-run/node";
import DynamoDB from "aws-sdk/clients/dynamodb";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { Table, ZOAuthStateCode, ZUser } from "table";
import { z } from "zod";
import axios from "axios";
import { generateExpiry } from "~/cookies.server";
import { commitSession } from "~/session.server";

const ZCodeSearchParam = z.object({ id: z.string(), redirect_uri: z.string().optional() });
const ZAccessTokenRes = z.object({ access_token: z.string(), scope: z.string(), token_type: z.string() });
const ZGithubUserInfo = z.object({
  login: z.string(),
  id: z.number(),
  name: z.string(),
  avatar_url: z.string(),
  html_url: z.string(),
});

// check for required environment variables
if (!process.env.REGION) throw new Error("'REGION' env-var is not defined.");
if (!process.env.TABLE_NAME) throw new Error("'TABLE_NAME' env-var is not defined.");
if (!process.env.GITHUB_CLIENT_ID_PATH) throw new Error("'GITHUB_CLIENT_ID_PATH' env-var is not defined.");
if (!process.env.GITHUB_CLIENT_SECRET_PATH) throw new Error("'GITHUB_CLIENT_SECRET_PATH' env-var is not defined.");

// create the aws-sdk clients
const ssmClient = new SSMClient({ region: process.env.REGION });
const ddbClient = new DynamoDB.DocumentClient({ region: process.env.REGION });
const table = new Table({ tableName: process.env.TABLE_NAME, client: ddbClient });

export const loader: LoaderFunction = async ({ request }) => {
  const reqUrl = new URL(request.url);
  const search = new URLSearchParams(reqUrl.search);

  // check for requisite returned items
  if (!search.has("state") || !search.has("code")) redirect(reqUrl.origin);

  // get the oauth_state_code record from the db
  const state = ZCodeSearchParam.parse(JSON.parse(search.get("state")!));
  const stateCode = await table.entities.oAuthStateCode
    .get({ pk: `oauth_state_code#${state.id}`, sk: `oauth_state_code#${state.id}` })
    .then(({ Item }) => Item);

  // ensure the stateCode record exists and matches the state
  if (!(stateCode && ZOAuthStateCode.parse(stateCode).code === search.get("code"))) redirect(reqUrl.origin);

  // retrieve github client credentials
  const client_id = await ssmClient
    .send(new GetParameterCommand({ Name: process.env.GITHUB_CLIENT_ID_PATH, WithDecryption: true }))
    .then(({ Parameter }) => z.object({ Value: z.string() }).parse(Parameter).Value);
  const client_secret = await ssmClient
    .send(new GetParameterCommand({ Name: process.env.GITHUB_CLIENT_SECRET_PATH, WithDecryption: true }))
    .then(({ Parameter }) => z.object({ Value: z.string() }).parse(Parameter).Value);

  // request access_token from github on behalf of user
  const post = { client_id, client_secret, code: search.get("code")! };
  const { access_token, token_type } = await axios
    .post("https://github.com/login/oauth/access_token", post, { headers: { Accept: "application/json" } })
    .then(({ data }) => ZAccessTokenRes.parse(data));

  // get the userinfo from github
  const userInfo = await axios
    .get("https://api.github.com/user", {
      headers: { Authorization: `${token_type} ${access_token}` },
    })
    .then(({ data }) => ZGithubUserInfo.parse(data))
    .then((data) => ({
      id: data.id.toString(),
      username: data.login,
      name: data.name,
      avatar_url: data.avatar_url,
      github_url: data.html_url,
    }));

  // get the user from our database (if they exist)
  let user = await table.entities.user
    .get({ pk: `user#${userInfo.id}`, sk: `user#${userInfo.id}` })
    .then(({ Item }) => Item);

  if (user) {
    // sync our database with user's github info
    user = await table.entities.user.update(userInfo, { returnValues: "ALL_NEW" }).then(({ Attributes }) => Attributes);
  } else if (!user) {
    // create the user
    user = await table.entities.user
      .update({ ...userInfo, roles: ["basic"] }, { returnValues: "ALL_NEW" })
      .then(({ Attributes }) => Attributes);
  }

  // ensure that user has correct schema
  user = ZUser.parse(user);

  // create the user session
  const [expires, domain, secure] = [
    generateExpiry(),
    reqUrl.hostname === "localhost" ? undefined : reqUrl.hostname,
    reqUrl.hostname === "localhost" ? false : true,
  ];
  const session = createSession({ user_id: user.id });
  const cookie = await commitSession(session, { expires, domain, secure });

  return redirect(state.redirect_uri ? state.redirect_uri : new URL(request.url).origin, {
    headers: { "Set-Cookie": cookie },
  });
};
