import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import {
  LambdaClient,
  GetFunctionConfigurationCommand,
  UpdateFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { z } from "zod";

const ZEventResourceProperties = z.object({ Arn: z.string(), App: z.string(), Stage: z.string() });

export async function handler(event: CloudFormationCustomResourceEvent, context: Context) {
  console.log(JSON.stringify(event));

  const lambda = new LambdaClient();
  const ssm = new SSMClient();

  // Retrieve the CustomResource inputs
  const { Arn, App, Stage } = await ZEventResourceProperties.parseAsync(event.ResourceProperties).catch((e) => {
    console.error("Required inputs did not match. Please check the 'Arn', 'App', 'Stage' are valid inputs.");
    throw e;
  });

  // Compare Lambda Environment
  // --------------------------
  // We need to determine if and what should be updated by comparing the current lambda's environment variables with
  // the corresponding values from SSM. The only values that could be out-of-configuration are the Config.Parameter
  // values since Config.Secret values are fetched at runtime.

  // (1) Retrieve the current environment variables from lambda
  const getFnCfgCmd = new GetFunctionConfigurationCommand({ FunctionName: Arn });
  const currentEnv = await lambda
    .send(getFnCfgCmd)
    .then(({ Environment }) => Environment?.Variables ?? {})
    .catch((e) => {
      console.error("Couldn't retrieve the lambda config. Please check the 'Arn' matches an existing lambda.");
      throw e;
    });

  // (2) Filter the lambda env for Config.Parameter
  const paramsFromEnv = Object.entries(currentEnv).filter(([k]) => /SST_Parameter_value_.*/.test(k));

  // (3) Retrieve the Config.Parameter's values from SSM
  let ssmParamReqs: Promise<[string, string]>[] = [];
  for (const [k, v] of paramsFromEnv) {
    // Request SSM Value for Config.Parameters
    // ---------------------------------------
    // The paramsFromEnv will hold the kv-pair of the environment variable on the lambda function. For all
    // Config.Parameter values the key will be in the pattern of 'SST_Parameter_value_{PARAM_NAME}'.
    const path = `/sst/${App}/${Stage}/Parameter/${k.replace(/^SST_Parameter_value_/, "")}/value`;
    const ssmValue = ssm.send(new GetParameterCommand({ Name: path })).then(({ Parameter }) => {
      if (!Parameter?.Value) throw new Error(`Error retrieving the SSM value ${path}. Please confirm it exists.`);
      return Parameter.Value;
    });

    // The new environment should have identical keys, and possibly a new value. Use Promises to allow all values
    // to be fetched in parallel.
    ssmParamReqs.push(new Promise(async (res) => res([k, await ssmValue])));
  }
  const paramsFromSsm = await Promise.all(ssmParamReqs).then((kvs) => Object.fromEntries(kvs));

  // (4) Create the future environment
  const futureEnv = { ...currentEnv, ...paramsFromSsm };

  // (5) Create the command to update the environment
  const updateEnvCmd = new UpdateFunctionConfigurationCommand({
    FunctionName: Arn,
    Environment: { Variables: futureEnv },
  });

  switch (event.RequestType) {
    case "Create": {
      // Since a ResourceProperty of '_RunOnEveryDeploy' set to the current Date, this CustomResource lambda will run
      // every deploy. For this reason we should check that there is actually a difference between the current params
      // and the future params before we restart all lambdas.
      if (JSON.stringify(paramsFromEnv) !== JSON.stringify(paramsFromSsm)) {
        await lambda.send(updateEnvCmd);
        console.log(`Updated environment for: ${Arn}`);
      }
      return;
    }
    case "Update": {
      // Since a ResourceProperty of '_RunOnEveryDeploy' set to the current Date, this CustomResource lambda will run
      // every deploy. For this reason we should check that there is actually a difference between the current params
      // and the future params before we restart all lambdas.
      if (JSON.stringify(paramsFromEnv) !== JSON.stringify(paramsFromSsm)) {
        await lambda.send(updateEnvCmd);
        console.log(`Updated environment for: ${Arn}`);
      }
      return;
    }
    case "Delete":
      return;
    default:
      throw new Error("Invalid Event");
  }
}
