import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import jwt from "jsonwebtoken";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // Request /token?u=ChakraUi
  // check for environment variables
  if (!process.env.USER_TABLE) {
    console.error("process.env.USER_TABLE does not exist.");
    return { statusCode: 500 };
  }
  if (!process.env.KEY_TABLE) {
    console.error("process.env.KEY_TABLE does not exist.");
    return { statusCode: 500 };
  }

  try {
    const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });

    // get the user query parameter
    const username = event.queryStringParameters?.u;
    if (!username) {
      console.error("Query parameter 'u' must be provided.");
      return { statusCode: 500 };
    }

    // (1) Get the user from the userTable
    const getUser = new GetItemCommand({
      TableName: process.env.USER_TABLE,
      Key: { PK: { S: `USER#${username}` } },
    });
    const user = await ddb.send(getUser);

    // (2) Get the active private key from the keyTable
    const getKey = new GetItemCommand({
      TableName: process.env.KEY_TABLE,
      Key: { PK: { S: `KEY#ACTIVE` } },
    });
    const key = await ddb.send(getKey);

    // (3) Create the accessToken & refreshToken

    // (4) Store the refreshToken in the userTable

    // (5) Return the accessToken & refreshToken
    const a = jwt.sign(JSON.stringify({ username: "sup" }), "secret", {
      algorithm: "RS256",
      keyid: "sup",
    });
    console.log("Encoded: " + a);
    console.log("Decoded: " + JSON.stringify(jwt.decode(a)));
  } catch (e) {
    console.error(e);
    return { statusCode: 500 };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, Wrold! Your request was received at ${event.requestContext.time}.`,
  };
};
