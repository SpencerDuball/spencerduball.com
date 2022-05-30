import { Construct } from "constructs";
import {
  AwsCustomResource,
  PhysicalResourceId,
  AwsCustomResourcePolicy,
} from "aws-cdk-lib/custom-resources";

export function getSecureSSMParameter(
  scope: Construct,
  id: string,
  name: string
) {
  return new AwsCustomResource(scope, id, {
    onCreate: {
      service: "SSM",
      action: "getParameter",
      parameters: {
        Name: name,
        WithDecryption: true,
      },
      physicalResourceId: PhysicalResourceId.fromResponse("Parameter.ARN"),
    },
    policy: AwsCustomResourcePolicy.fromSdkCalls({
      resources: AwsCustomResourcePolicy.ANY_RESOURCE,
    }),
  });
}
