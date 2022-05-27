import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { randomUUID } from "crypto";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

export const githubSignin: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(event);

  // check that required environement variables are defined
  if (!process.env.GITHUB_CLIENT_ID) return { statusCode: 500 };
  if (!process.env.DDB_TABLE_NAME) return { statusCode: 500 };
  if (!process.env.DDB_TABLE_REGION) return { statusCode: 500 };

  // build the redirect url
  const stateToken = randomUUID();
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.append("client_id", process.env.GITHUB_CLIENT_ID);
  url.searchParams.append(
    "redirect_uri",
    new URL("https://api.spencerduball.com/auth/github/callback").toString()
  );
  url.searchParams.append("scope", "read:user");
  url.searchParams.append("state", stateToken);

  // store the "state" code in the CSRF table
  const TIMEOUT_IN_SECONDS = 1800; // 30 minute timeout
  const returnUrl = event.headers.referer
    ? event.headers.referer
    : "https://spencerduball.com";
  const ddb = new DynamoDBClient({ region: process.env.DDB_TABLE_REGION });
  const put = new PutItemCommand({
    TableName: process.env.DDB_TABLE_NAME,
    Item: {
      PK: { S: `TOKEN#${stateToken}` },
      REFERER: { S: returnUrl },
      TTL: {
        N: `${Math.floor(new Date().getTime() / 1000) + TIMEOUT_IN_SECONDS}`,
      },
    },
  });
  const res = await ddb.send(put);

  console.log(res);
  console.log(url);
  return {
    statusCode: 302,
    headers: { Location: url.toString() },
  };
};
