import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  DynamoDBClient,
  GetItemCommand,
  BatchWriteItemCommand,
  UpdateItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { generateKeyInfo } from "util/generate-key-info";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function newKeyItem(PK: string, keyInfo: ReturnType<typeof generateKeyInfo>) {
  const { jwk, ...rest } = keyInfo;
  const keyMap = Object.entries({ PK, ...jwk, ...rest }).reduce(
    (prev, [k, v]) => ({ [k]: { S: v }, ...prev }),
    {}
  );
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
  if (!process.env.REFRESH_TOKEN_LENGTH) {
    console.error("process.env.REFRESH_TOKEN_LENGTH is not defined.");
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
      const kid = getKeyRes.Item.kid.S;

      // assign an "expires_at" to the old key, it will be auto-deleted
      const updateKey = new UpdateItemCommand({
        TableName: process.env.KEY_TABLE,
        Key: { PK: { S: `KEY#${kid}` } },
        UpdateExpression: `SET expires_at = :expires_at`,
        ExpressionAttributeValues: {
          ":expires_at": {
            N: (
              Math.floor(+new Date() / 1000) +
              parseInt(process.env.REFRESH_TOKEN_LENGTH)
            ).toString(),
          },
        },
      });
      await ddb.send(updateKey);
    }

    //////////////////////////////////////////////////////////////////////////
    // (2) Create the new Keys and assign to Active key
    //////////////////////////////////////////////////////////////////////////
    // create a new key and set it to be the active key
    const newKey = generateKeyInfo();
    const createKeys = new BatchWriteItemCommand({
      RequestItems: {
        [process.env.KEY_TABLE]: [
          newPutRequest(newKeyItem(`KEY#ACTIVE`, newKey)),
          newPutRequest(newKeyItem(`KEY#${newKey.jwk.kid}`, newKey)),
        ],
      },
    });
    await ddb.send(createKeys);

    //////////////////////////////////////////////////////////////////////////
    // (3) Update the jwks.json file with the full key list
    //////////////////////////////////////////////////////////////////////////
    // get all available keys
    const getAllKeys = new ScanCommand({
      TableName: process.env.KEY_TABLE,
      ProjectionExpression: "#pk, #alg, #use, #kid, #kty, #n, #e",
      ExpressionAttributeNames: {
        "#pk": "PK",
        "#alg": "alg",
        "#use": "use",
        "#kid": "kid",
        "#kty": "kty",
        "#n": "n",
        "#e": "e",
      },
    });
    const allKeys = await ddb.send(getAllKeys);

    // create the jwks.json content
    const normalizedKeys = allKeys.Items?.filter(
      (item) => item.PK.S !== "KEY#ACTIVE"
    ).map((item) =>
      Object.entries(item)
        .filter(([k]) => k !== "PK")
        .reduce((prev, [k, v]) => ({ [k]: v.S, ...prev }), {})
    );
    const jwksJson = JSON.stringify({ keys: normalizedKeys });

    // send to s3
    const s3 = new S3Client({ region: process.env.AWS_REGION });
    const putJwksJson = new PutObjectCommand({
      Bucket: process.env.WELL_KNOWN_BUCKET,
      Key: ".well-known/jwks.json",
      Body: jwksJson,
      ContentType: "application/json",
    });
    await s3.send(putJwksJson);

    return { statusCode: 200 };
  } catch (e) {
    console.error(e);
    return { statusCode: 500 };
  }
};
