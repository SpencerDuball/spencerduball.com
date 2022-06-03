import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  DynamoDBClient,
  GetItemCommand,
  BatchWriteItemCommand,
  UpdateItemCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { generateKeyInfo } from "util/generate-key-info";

function newKeyItem(
  PK: string,
  keyInfo: ReturnType<typeof generateKeyInfo>,
  refresh_token_duration: number,
  access_token_duration: number
) {
  const { jwk, ...rest } = keyInfo;
  let keyMap: Record<string, AttributeValue> = Object.entries({
    PK,
    ...jwk,
    ...rest,
  }).reduce((prev, [k, v]) => ({ [k]: { S: v }, ...prev }), {});
  keyMap.refresh_token_duration = { N: refresh_token_duration.toString() };
  keyMap.access_token_duration = { N: access_token_duration.toString() };
  return keyMap;
}
function newPutRequest(payload: ReturnType<typeof newKeyItem>) {
  return { PutRequest: { Item: { ...payload } } };
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // check for environment variables
  if (!process.env.AWS_REGION) {
    console.error("process.env.AWS_REGION is not defined.");
    return { statusCode: 500 };
  }
  if (!process.env.KEY_TABLE) {
    console.error("process.env.KEY_TABLE is not defined.");
    return { statusCode: 500 };
  }
  if (!process.env.REFRESH_TOKEN_DURATION) {
    console.error("process.env.REFRESH_TOKEN_DURATION is not defined.");
    return { statusCode: 500 };
  }
  if (!process.env.ACCESS_TOKEN_DURATION) {
    console.error("process.env.ACCESS_TOKEN_DURATION is not defined.");
    return { statusCode: 500 };
  }

  try {
    //////////////////////////////////////////////////////////////////////////
    // (1) Get the Active Key and add "expires_at"
    //////////////////////////////////////////////////////////////////////////
    // get the active key
    const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });
    const getKey = new GetItemCommand({
      TableName: process.env.KEY_TABLE,
      Key: { PK: { S: `KEY#ACTIVE` } },
    });
    const getKeyRes = await ddb.send(getKey);

    // if the key was found, update expires_at
    if (getKeyRes.Item) {
      // get the kid
      const {
        kid: { S: kid },
        refresh_token_duration: { N: refreshInS },
      } = getKeyRes.Item;

      // assign an "expires_at" to the old key, it will be auto-deleted
      const updateKey = new UpdateItemCommand({
        TableName: process.env.KEY_TABLE,
        Key: { PK: { S: `KEY#${kid}` } },
        UpdateExpression: `SET expires_at = :expires_at`,
        ExpressionAttributeValues: {
          ":expires_at": {
            N: (
              Math.floor(+new Date() / 1000) + parseInt(refreshInS || "0")
            ).toString(),
          },
        },
      });
      await ddb.send(updateKey);
    }

    //////////////////////////////////////////////////////////////////////////
    // (2) Create the new Keys and assign to Active key
    //////////////////////////////////////////////////////////////////////////
    const refreshInS = parseInt(process.env.REFRESH_TOKEN_DURATION);
    const accessInS = parseInt(process.env.ACCESS_TOKEN_DURATION);
    // create a new key and set it to be the active key
    const newKey = generateKeyInfo();
    const createKeys = new BatchWriteItemCommand({
      RequestItems: {
        [process.env.KEY_TABLE]: [
          newPutRequest(
            newKeyItem(`KEY#ACTIVE`, newKey, refreshInS, accessInS)
          ),
          newPutRequest(
            newKeyItem(`KEY#${newKey.jwk.kid}`, newKey, refreshInS, accessInS)
          ),
        ],
      },
    });
    await ddb.send(createKeys);

    return { statusCode: 200 };
  } catch (e) {
    console.error(e);
    return { statusCode: 500 };
  }
};
