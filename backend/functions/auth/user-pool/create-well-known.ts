import { CdkCustomResourceHandler } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

export const handler: CdkCustomResourceHandler = async (event) => {
  // check for environment variables
  if (!process.env.AWS_REGION) {
    console.error("process.env.AWS_REGION is not defined.");
    return { statusCode: 500 };
  }
  if (!process.env.PUBLIC_BUCKET) {
    console.error("process.env.PUBLIC_BUCKET is not defined.");
    return { statusCode: 500 };
  }
  if (!process.env.KEY_TABLE) {
    console.error("process.env.KEY_TABLE is not defined.");
    return { statusCode: 500 };
  }
  if (!process.env.ISSUER_URL) {
    console.error("process.env.ISSUER_URL is not defined.");
    return { statusCode: 500 };
  }

  try {
    const s3 = new S3Client({ region: process.env.AWS_REGION });

    // write the jwks.json file
    const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });
    const getActiveKey = new GetItemCommand({
      TableName: process.env.KEY_TABLE,
      Key: { PK: { S: "KEY#ACTIVE" } },
      ProjectionExpression: "#pk, #alg, #e, #kid, #kty, #n, #use",
      ExpressionAttributeNames: {
        "#pk": "PK",
        "#alg": "alg",
        "#e": "e",
        "#kid": "kid",
        "#kty": "kty",
        "#n": "n",
        "#use": "use",
      },
    });
    const activeKey = await ddb.send(getActiveKey);
    if (activeKey.Item) {
      const {
        alg: { S: alg },
        e: { S: e },
        kid: { S: kid },
        kty: { S: kty },
        n: { S: n },
        use: { S: use },
      } = activeKey.Item;

      const putJwksJson = new PutObjectCommand({
        Bucket: process.env.PUBLIC_BUCKET,
        Key: ".well-known/jwks.json",
        Body: JSON.stringify({ keys: [{ alg, e, kid, kty, n, use }] }),
        ContentType: "application/json",
      });
      await s3.send(putJwksJson);
    } else {
      console.error("Error getting KEY#ACTIVE.");
      return { statusCode: 500 };
    }

    // write the openid-configuration file
    const data = {
      issuer: process.env.ISSUER_URL,
      jwks_uri: `${process.env.ISSUER_URL}/.well-known/jwks.json`,
    };
    const putOpenIdConfig = new PutObjectCommand({
      Bucket: process.env.PUBLIC_BUCKET,
      Key: ".well-known/openid-configuration",
      Body: JSON.stringify(data),
      ContentType: "application/json",
    });

    await s3.send(putOpenIdConfig);
  } catch (e) {
    console.error(e);
    return { statusCode: 500 };
  }

  return { PhysicalResourceId: randomUUID() };
};
