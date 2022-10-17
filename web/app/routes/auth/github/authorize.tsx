import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { z } from "zod";
import { Table, ZOAuthStateCode } from "table";
import DynamoDB from "aws-sdk/clients/dynamodb";

// check for required environment variables
if (!process.env.REGION) throw new Error("'REGION' env-var is not defined.");
if (!process.env.TABLE_NAME) throw new Error("'TABLE_NAME' env-var is not defined.");
if (!process.env.GITHUB_CLIENT_ID_PATH) throw new Error("'GITHUB_CLIENT_ID_PATH' env-var is not defined.");

// create the aws-sdk clients
const ssmClient = new SSMClient({ region: process.env.REGION });
const ddbClient = new DynamoDB.DocumentClient({ region: process.env.REGION });
const table = new Table({ tableName: process.env.TABLE_NAME, client: ddbClient });

export const loader: LoaderFunction = async ({ request }) => {
  const reqUrl = new URL(request.url);
  const search = new URLSearchParams(reqUrl.search);

  // get the github client id
  const clientId = await ssmClient
    .send(new GetParameterCommand({ Name: process.env.GITHUB_CLIENT_ID_PATH, WithDecryption: true }))
    .then(({ Parameter }) => z.object({ Value: z.string() }).parse(Parameter).Value);

  // create a state token
  const stateCode = await table.entities.oAuthStateCode
    .update(search.has("redirect_uri") ? { redirect_uri: search.get("redirect_uri")! } : {}, {
      returnValues: "ALL_NEW",
    })
    .then(({ Attributes }) => ZOAuthStateCode.parse(Attributes));

  // build the oauth request url
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", `${reqUrl.origin}/auth/github/callback`);
  url.searchParams.append("scope", "user");
  url.searchParams.append("state", stateCode.code);

  // send the request to github
  return redirect(url.toString());
};
