import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  DynamoDBClient,
  GetItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import * as Yup from "yup";
import axios from "axios";
import crypto from "crypto";

// defined searchParams schema
const searchParams = Yup.object({
  code: Yup.string().defined(),
  state: Yup.string().defined(),
});

/**
 * Encryption utility to encrypt and decrypt messages.
 *
 * @param key Should be a 32-length Buffer object.
 * @param iv Should be a 16-length Buffer object.
 *
 * @example const encryptor = new Encryptor(crypto.randomBytes(32), crypto.randomBytes(16));
 */
class Encryptor {
  public readonly algorithm = "aes-256-cbc";
  private key: Buffer;
  private iv: Buffer;

  constructor(key: Buffer, iv: Buffer) {
    this.key = key;
    this.iv = iv;
  }

  public encrypt(
    message: string,
    inputEnc: crypto.Encoding = "utf-8",
    outputEnc: crypto.Encoding = "base64"
  ) {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    return (
      cipher.update(message, inputEnc, outputEnc) + cipher.final(outputEnc)
    );
  }

  public decrypt(
    encryptedData: string,
    inputEnc: crypto.Encoding = "base64",
    outputEnc: crypto.Encoding = "utf-8"
  ) {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    return (
      decipher.update(encryptedData, inputEnc, outputEnc) +
      decipher.final(outputEnc)
    );
  }
}

export const githubOAuthCallback: APIGatewayProxyHandlerV2<{
  message: string;
}> = async (event) => {
  console.log(event);

  // check that required environment variables are defined
  if (!process.env.GITHUB_CLIENT_ID) return { statusCode: 500 };
  if (!process.env.GITHUB_CLIENT_SECRET) return { statusCode: 500 };
  if (!process.env.GITHUB_CLIENT_CALLBACK) return { statusCode: 500 };
  if (!process.env.DDB_TABLE_NAME) return { statusCode: 500 };
  if (!process.env.REGION) return { statusCode: 500 };
  if (!process.env.USER_POOL_ID) return { statusCode: 500 };
  if (!process.env.USER_POOL_CLIENT_ID) return { statusCode: 500 };
  if (!process.env.PASSWORD_CIPHER_INFO) return { statusCode: 500 };
  console.log(1);

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
    region: process.env.REGION,
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
  console.log(2);

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
  console.log(3);

  // get the user info
  const headers = {
    Authorization: `${accessToken.data.token_type} ${accessToken.data.access_token}`,
    Accept: "application/vnd.github.v3+json",
  };
  const userName = await axios.get("https://api.github.com/user", { headers });
  const { login, avatar_url, url, email } = userName.data;

  // check if the user exists by attempting to sign in
  const { key, keyEncoding, iv, ivEncoding } = JSON.parse(
    process.env.PASSWORD_CIPHER_INFO
  );
  const encryptor = new Encryptor(
    Buffer.from(key, keyEncoding),
    Buffer.from(iv, ivEncoding)
  );
  const cognito = new CognitoIdentityProviderClient({
    region: process.env.REGION,
  });
  console.log(4);
  const getUser = new AdminInitiateAuthCommand({
    AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
    UserPoolId: process.env.USER_POOL_ID,
    ClientId: process.env.USER_POOL_CLIENT_ID,
    AuthParameters: {
      USERNAME: login,
      PASSWORD: encryptor.encrypt(login),
    },
  });
  try {
    const res = await cognito.send(getUser);
    console.log(res);
  } catch (e) {
    console.log(JSON.stringify(e));

    // if user doesn't exist, we will create them and sign them in
    if (e.name === "UserNotFoundException") {
      // create the new user
      try {
        // create user
        const createUser = new AdminCreateUserCommand({
          UserPoolId: process.env.USER_POOL_ID,
          Username: login,
          UserAttributes: [
            { Name: "profile", Value: url },
            { Name: "picture", Value: avatar_url },
            { Name: "email", Value: email },
            { Name: "email_verified", Value: "true" },
          ],
          MessageAction: "SUPPRESS",
        });
        const newUser = await cognito.send(createUser);
        console.log(newUser);

        // set encrypted password
        const setPassword = new AdminSetUserPasswordCommand({
          UserPoolId: process.env.USER_POOL_ID,
          Username: login,
          Password: encryptor.encrypt(login),
          Permanent: true,
        });
        const newPassword = await cognito.send(setPassword);
        console.log(newPassword);

        // sign in user and return tokens
        const signIn = new AdminInitiateAuthCommand({
          AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
          UserPoolId: process.env.USER_POOL_ID,
          ClientId: process.env.USER_POOL_CLIENT_ID,
          AuthParameters: {
            USERNAME: login,
            PASSWORD: encryptor.encrypt(login),
          },
        });
        const signedIn = await cognito.send(signIn);
        console.log(signedIn);
      } catch (e) {
        console.log("Error here:");
        console.log(e);
      }
    }
  }
  console.log(5);

  // get the redirect_uri
  const redirect_url = res.Item?.REFERER?.S
    ? res.Item.REFERER.S
    : "https://spencerduball.com";

  return {
    statusCode: 302,
    headers: { Location: redirect_url.toString() },
  };
};
