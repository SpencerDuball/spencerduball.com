import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { GetParameterCommand, PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";
import {
  GetFunctionConfigurationCommand,
  UpdateFunctionConfigurationCommand,
  LambdaClient,
} from "@aws-sdk/client-lambda";

export async function updateLambdaEnvironment(event: CloudFormationCustomResourceEvent, context: Context) {
  console.log(JSON.stringify(event));

  // define clients
  const lambda = new LambdaClient();
  const ssm = new SSMClient();

  // Retrieve Current Lambda Environment & Build Future Lambda Environment
  // ---------------------------------------------------------------------
  // Since the ARN of the function has been passed in we can get the environment variables for that lambda function,
  // parse the parameters, and then generate an object representing the new environment. If the environments differ
  // then we will update the lambda function's configuration.
  const { FnArn, AppName, StageName } = event.ResourceProperties;

  // (1) Retrieve the current environment variables from lambda
  const getConfigCmd = new GetFunctionConfigurationCommand({ FunctionName: FnArn });
  const currentEnv = await lambda.send(getConfigCmd).then(({ Environment }) => Environment?.Variables || {});

  // (2) Parse the parameters from the environment variables
  const paramsFromEnv = Object.entries(currentEnv).filter(([k]) => !!k.match(/SST_Parameter_value_.*/));

  // (3) Retrieve the parameter's values from SSM
  async function getSsmValue(name: string) {
    // turn the name into a path to be serched for
    const path = `/sst/${AppName}/${StageName}/Parameter/${name.replace(/^SST_Parameter_value_/, "")}/value`;
    return ssm.send(new GetParameterCommand({ Name: path })).then(({ Parameter }) => {
      if (!Parameter?.Value) throw new Error(`The parameter ${name} did not exist.`);
      else return Parameter.Value;
    });
  }
  const paramsFromSsm = await Promise.all(
    paramsFromEnv.map(async ([k, v]) => [k, await getSsmValue(k)] as [string, string])
  );

  // (4) Create the future environment
  const futureEnv = { ...currentEnv, ...Object.fromEntries(paramsFromSsm) };

  // (5) Create the command to update the environment
  const updateEnvCmd = new UpdateFunctionConfigurationCommand({
    FunctionName: FnArn,
    Environment: { Variables: futureEnv },
  });

  switch (event.RequestType) {
    case "Create": {
      if (JSON.stringify(paramsFromEnv) !== JSON.stringify(paramsFromSsm)) await lambda.send(updateEnvCmd);
      return;
    }
    case "Update": {
      if (JSON.stringify(paramsFromEnv) !== JSON.stringify(paramsFromSsm)) await lambda.send(updateEnvCmd);
      return;
    }
    case "Delete": {
      return;
    }
    default:
      throw new Error("Invalid Event");
  }
}

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
