import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";

export async function updateSsmParameter(event: CloudFormationCustomResourceEvent, context: Context) {
  console.log(JSON.stringify(event));

  const ssm = new SSMClient();
  const putCmd = new PutParameterCommand({
    Overwrite: true,
    Name: event.ResourceProperties.Name,
    Value: event.ResourceProperties.Value,
  });

  switch (event.RequestType) {
    case "Create": {
      await ssm.send(putCmd);
      return;
    }
    case "Update": {
      // update if site url has changed
      if (event.OldResourceProperties.Value !== event.ResourceProperties.Value) await ssm.send(putCmd);
      return;
    }
    case "Delete": {
      // implement deletion of custom resource
      return;
    }
    default:
      throw new Error("Invalid Event");
  }
}

export async function addCorsRule(event: CloudFormationCustomResourceEvent, context: Context) {
  console.log(JSON.stringify(event));

  // define the ResourceProperties schema
  const ZResourceProperties = z.object({ SiteUrl: z.string(), BucketName: z.string() });

  // retrieve the BucketName and SiteUrl
  const { SiteUrl, BucketName } = ZResourceProperties.parse(event.ResourceProperties);

  // create the S3 client
  const s3 = new S3Client();

  // define the default CORS command
  const putCmd = new PutBucketCorsCommand({
    Bucket: BucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "PUT", "HEAD", "POST", "DELETE"],
          AllowedOrigins: [SiteUrl.replace(/\:d+$/, "")],
        },
      ],
    },
  });

  switch (event.RequestType) {
    case "Create": {
      // delete the existing CORS config, and then update the CORS config
      await s3.send(putCmd);
      return;
    }
    case "Update": {
      const { SiteUrl: OldSiteUrl, BucketName: OldBucketName } = ZResourceProperties.parse(event.OldResourceProperties);

      // update the CORS rules if the inputs differ
      if (OldSiteUrl !== SiteUrl || OldBucketName !== BucketName) await s3.send(putCmd);
      return;
    }
    case "Delete": {
      // update the CORS rules to the default
      const defaultPutCmd = new PutBucketCorsCommand({
        Bucket: BucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "HEAD", "POST", "DELETE"],
              AllowedOrigins: ["*"],
            },
          ],
        },
      });
      await s3.send(defaultPutCmd);
      return;
    }
    default:
      throw new Error("Invalid Event");
  }
}
