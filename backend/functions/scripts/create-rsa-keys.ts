import { CdkCustomResourceHandler } from "aws-lambda";
import { generateKeyInfo, IJWK } from "util/generate-key-info";
import {
  DynamoDBClient,
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

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

export const handler: CdkCustomResourceHandler = async (event) => {
  const keyInfo = generateKeyInfo();

  // check for environment variables
  if (!process.env.AWS_REGION) {
    console.error("process.env.AWS_REGION is not defined.");
    return { statusCode: 500 };
  }
  if (!process.env.KEY_TABLE) {
    console.error("process.env.KEY_TABLE is not defined.");
    return { statusCode: 500 };
  }
  if (!process.env.WELL_KNOWN_BUCKET) {
    console.error("process.env.WELL_KNOWN_BUCKET is not defined.");
    return { statusCode: 500 };
  }
  if (!process.env.ISSUER) {
    console.error("process.env.ISSUER is not defined.");
    return { statusCode: 500 };
  }

  // write the key to the db and set as active key
  try {
    const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });
    const createKeys = new BatchWriteItemCommand({
      RequestItems: {
        [process.env.KEY_TABLE]: [
          newPutRequest(newKeyItem(`KEY#ACTIVE`, keyInfo)),
          newPutRequest(newKeyItem(`KEY#${keyInfo.jwk.kid}`, keyInfo)),
        ],
      },
    });

    await ddb.send(createKeys);
  } catch (e) {
    console.error(e);
    return { statusCode: 500 };
  }

  // write the jwks.json and openid-configuration files to the .well-known folder
  try {
    const s3 = new S3Client({ region: process.env.AWS_REGION });

    // write the jwks.json file
    const putJwksJson = new PutObjectCommand({
      Bucket: process.env.WELL_KNOWN_BUCKET,
      Key: ".well-known/jwks.json",
      Body: JSON.stringify({ keys: [keyInfo.jwk] }),
      ContentType: "application/json",
    });

    // write the openid-configuration file
    const putOpenIdConfig = new PutObjectCommand({
      Bucket: process.env.WELL_KNOWN_BUCKET,
      Key: ".well-known/openid-configuration",
      Body: JSON.stringify({
        issuer: process.env.ISSUER,
        jwks_uri: `${process.env.ISSUER}/.well-known/jwks.json`,
      }),
      ContentType: "application/json",
    });

    await Promise.all([s3.send(putJwksJson), s3.send(putOpenIdConfig)]);
  } catch (e) {
    console.error(e);
    return { statusCode: 500 };
  }

  return { PhysicalResourceId: randomUUID() };
};
