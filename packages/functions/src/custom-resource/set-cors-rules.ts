import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { z } from "zod";

const ZCorsRule = z.object({
  id: z.string().optional(),
  maxAge: z.number().optional(),
  allowedHeaders: z.string().array().optional(),
  allowedMethods: z.string().array(),
  allowedOrigins: z.string().array(),
  exposedHeaders: z.string().array().optional(),
});

const ZEventResourceProperties = z.object({ Bucket: z.string(), Rules: ZCorsRule.array() });

export async function handler(event: CloudFormationCustomResourceEvent, context: Context) {
  console.log(JSON.stringify(event));

  const s3 = new S3Client();

  // Retrieve the CustomResource inputs
  const { Bucket, Rules } = await ZEventResourceProperties.parseAsync(event.ResourceProperties).catch((e) => {
    console.error("Required inputs did not match. Please check the 'Bucket' and 'Rules' are valid inputs.");
    throw e;
  });

  // Define the put command
  const CORSRules = Rules.map(
    ({
      id: ID,
      allowedHeaders: AllowedHeaders,
      allowedMethods: AllowedMethods,
      allowedOrigins: AllowedOrigins,
      exposedHeaders: ExposedHeaders,
      maxAge: MaxAgeSeconds,
    }) => ({ ID, AllowedHeaders, AllowedMethods, AllowedOrigins, ExposedHeaders, MaxAgeSeconds }),
  );
  const putCmd = new PutBucketCorsCommand({ Bucket, CORSConfiguration: { CORSRules } });

  switch (event.RequestType) {
    case "Create": {
      await s3.send(putCmd);
      console.log("Updated CORS rules.");
      return;
    }
    case "Update": {
      // Note: We don't need to compare the 'event.OldResourceProperties' to the 'event.ResourceProperties' because
      // CustomResource lambdas aren't even called if the input properties are the same.
      await s3.send(putCmd);
      console.log("Updated CORS rules with new values.");
      return;
    }
    case "Delete": {
      return;
    }
    default:
      throw new Error("Invalid Event");
  }
}
