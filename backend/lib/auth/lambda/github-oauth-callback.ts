import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  DynamoDBClient,
  GetItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import * as Yup from "yup";
import axios from "axios";

// defined searchParams schema
const searchParams = Yup.object({
  code: Yup.string().defined(),
  state: Yup.string().defined(),
});

export const githubOAuthCallback: APIGatewayProxyHandlerV2<{
  message: string;
}> = async (event) => {
  console.log(event);

  // check that required environment variables are defined
  if (!process.env.GITHUB_CLIENT_ID) return { statusCode: 500 };
  if (!process.env.GITHUB_CLIENT_SECRET) return { statusCode: 500 };
  if (!process.env.GITHUB_CLIENT_CALLBACK) return { statusCode: 500 };
  if (!process.env.DDB_TABLE_NAME) return { statusCode: 500 };
  if (!process.env.DDB_TABLE_REGION) return { statusCode: 500 };

  // get the code and state tokens from Github
  if (!searchParams.isValidSync(event.queryStringParameters)) {
    const errorMessage =
      "Query string parameters: `state` or `code` were not supplied." +
      " This appears to be an issue with Github, or the OAuth app.";
    console.log(errorMessage);
    return { statusCode: 500 };
  }
  const { code, state } = event.queryStringParameters;

  // ensure a matching state code exists in DDB CSRF table
  const ddb = new DynamoDBClient({
    region: process.env.DDB_TABLE_REGION,
    maxAttempts: 3,
  });
  const get = new GetItemCommand({
    TableName: process.env.DDB_TABLE_NAME,
    Key: { PK: { S: `TOKEN#${state}` } },
  });
  const res = await ddb.send(get);
  if (res) {
    const deleteCmd = new DeleteItemCommand({
      TableName: process.env.DDB_TABLE_NAME,
      Key: { PK: { S: `TOKENS#${state}` } },
    });
    await ddb.send(deleteCmd);
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Github CSRF code did not match." }),
    };
  }

  // get the access token from Github
  const accessToken = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_CLIENT_CALLBACK,
    },
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  // get the user info
  const headers = {
    Authorization: `${accessToken.data.token_type} ${accessToken.data.access_token}`,
    Accept: "application/vnd.github.v3+json",
  };
  const userName = await axios.get("https://api.github.com/user", { headers });
  const { login, avatar_url, name } = userName.data;

  console.log(login, avatar_url, name);

  // get the redirect_uri
  const redirect_url = res.Item?.REFERER?.S
    ? res.Item.REFERER.S
    : "https://spencerduball.com";

  return {
    statusCode: 302,
    headers: { Location: redirect_url.toString() },
  };
};
