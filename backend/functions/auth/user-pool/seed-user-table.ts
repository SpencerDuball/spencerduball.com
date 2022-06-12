import { randomUUID } from "crypto";
import { CdkCustomResourceHandler } from "aws-lambda";
import {
  DynamoDBClient,
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";

const userData = [
  [
    "NextJs",
    "https://twitter.com/nextjs",
    "https://twitter.com/nextjs/photo",
    "nextjs@yah.com",
    "admin",
  ],
  [
    "ChakraUi",
    "https://twitter.com/chakra_ui",
    "https://twitter.com/chakra_ui/photo",
    "chakra_ui@yah.com",
    "moderator",
  ],
  [
    "TailwindCss",
    "https://twitter.com/tailwindcss",
    "https://twitter.com/tailwindcss/photo",
    "tailwind_css@yah.com",
  ],
] as [string, string, string, string, string][];

function newUserRequest(
  preferred_username: string,
  profile: string,
  picture: string,
  email: string,
  scope?: string
) {
  return {
    PutRequest: {
      Item: {
        PK: { S: `USER#${preferred_username}` },
        type: { S: "TEST" },
        preferred_username: { S: preferred_username },
        profile: { S: profile },
        picture: { S: picture },
        email: { S: email },
        scope: { S: scope || "" },
      },
    },
  };
}

export const handler: CdkCustomResourceHandler = async (event) => {
  // check for environment variables
  if (!process.env.AWS_REGION) {
    throw new Error("process.env.AWS_REGION was not defined.");
  }
  if (!process.env.USER_TABLE) {
    throw new Error("process.env.USER_TABLE was not defined.");
  }

  // seed the user table with users
  const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });
  const seedCmd = new BatchWriteItemCommand({
    RequestItems: {
      [process.env.USER_TABLE]: userData.map((item) => newUserRequest(...item)),
    },
  });
  await ddb.send(seedCmd);

  return { PhysicalResourceId: randomUUID() };
};
