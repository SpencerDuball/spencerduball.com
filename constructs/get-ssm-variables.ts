import { Stack } from "aws-cdk-lib";
import {
  AwsCustomResource,
  PhysicalResourceId,
  AwsCustomResourcePolicy,
} from "aws-cdk-lib/custom-resources";

export interface ISSMVariable {
  /**
   * The name of the variable.
   * @example
   * If full path = "/myappname/dev/SECRET_VARIABLE", then
   * name = "SECRET_VARIABLE"
   */
  name: string;
  /** Flag if variable is encrypted. */
  isEncrypted: boolean;
}

export interface GetSSMVariablesProps {
  /**
   * The path prefix of all the variables.
   * @example
   * If full path = "/myappname/dev/SECRET_VARIABLE_*", then
   * prefix = "/myappname/dev/"
   */
  prefix: string;
  /** The individual variables to retrieve. */
  variables: ISSMVariable[];
}

export function getSSMVariables(scope: Stack, props: GetSSMVariablesProps) {
  return props.variables.map((variable) => {
    return new AwsCustomResource(scope, `ssm-${variable.name}`, {
      onCreate: {
        service: "SSM",
        action: "getParameter",
        parameters: {
          Name: `${props.prefix}${variable.name}`,
          WithDecryption: variable.isEncrypted,
        },
        physicalResourceId: PhysicalResourceId.fromResponse("Parameter.ARN"),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    }).getResponseField("Parameter.Value");
  });
}
