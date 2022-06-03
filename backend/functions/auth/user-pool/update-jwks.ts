import { DynamoDBStreamHandler } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const handler: DynamoDBStreamHandler = async (event) => {
  // check for environment variables
  if (!process.env.PUBLIC_BUCKET)
    throw new Error("process.env.PUBLIC_BUCKET is not defined.");
  if (!process.env.KEY_TABLE)
    throw new Error("process.env.KEY_TABLE is not defined.");

  for (let record of event.Records) {
    // when there is a delete event, upload a new jwks.json file
    if (record.eventName === "REMOVE" || record.eventName === "INSERT") {
      // get all available keys
      const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });
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
        Bucket: process.env.PUBLIC_BUCKET,
        Key: ".well-known/jwks.json",
        Body: jwksJson,
        ContentType: "application/json",
      });
      await s3.send(putJwksJson);
    }
  }
};
