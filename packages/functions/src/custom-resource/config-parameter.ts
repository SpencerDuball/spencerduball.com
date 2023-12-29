import { PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { z } from "zod";

const ZEventResourceProperties = z.object({ Value: z.string(), Path: z.string() });

export async function handler(event: CloudFormationCustomResourceEvent, context: Context) {
  console.log(JSON.stringify(event));

  const ssm = new SSMClient();

  // Retrieve the CustomResource inputs
  const { Value, Path: Name } = await ZEventResourceProperties.parseAsync(event.ResourceProperties).catch((e) => {
    console.error("Required inputs did not match. Please check the 'Value' and 'Path' are valid inputs.");
    throw e;
  });

  switch (event.RequestType) {
    case "Create": {
      await ssm.send(new PutParameterCommand({ Overwrite: true, Name, Value }));
      console.log(`Update resource to: ${Value}`);
      return;
    }
    case "Update": {
      if (event.OldResourceProperties.Value !== Value) {
        await ssm.send(new PutParameterCommand({ Overwrite: true, Name, Value }));
        console.log(`Updated resource from: ${event.OldResourceProperties.Value} to ${Value}`);
      }
      return;
    }
    case "Delete":
      return;
    default:
      throw new Error("Invalid Event");
  }
}
