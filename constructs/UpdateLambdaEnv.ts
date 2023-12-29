import { Construct } from "constructs";
import { App, Function } from "sst/constructs";
import { Provider } from "aws-cdk-lib/custom-resources";
import { CustomResource } from "aws-cdk-lib/core";
import { type IFunction } from "aws-cdk-lib/aws-lambda";

export interface UpdateLambdaEnvProps {
  /**
   * The Function whos environment will be updated.
   *
   * NOTE -
   * There is a strange behavior where SSRSite (RemixSite, etc) will first pass in an undefined variable and then it
   * will pass in the token reference. For this reason, 'undefined' is allowed as a potential value.
   * */
  Fn: IFunction | undefined;
}

/**
 * Updates an SST Function's environment variables that matches the passed ARN.
 *
 * In an SST stack we can create a Config.Parameter, however sometimes we need to update these Parameter values after
 * they are created. When these parameters are bound to a Lambda (such as an SSRSite) the value is passed statically.
 * This construct refetches the entire Lambda Environment and ensures it is up to date with the SSM parameters.
 */
export class UpdateLambdaEnv extends Construct {
  static fn: Function;
  static provider: Provider;

  constructor(scope: Construct, id: string, { Fn }: UpdateLambdaEnvProps) {
    super(scope, id);
    const app = this.node.root as App;

    // create the custom resource lambda if it doesn't exist
    if (!UpdateLambdaEnv.fn) {
      UpdateLambdaEnv.fn = new Function(scope, "UpdateLambdaEnvFn", {
        architecture: "arm_64",
        handler: "packages/functions/src/custom-resource/update-lambda-env.handler",
        enableLiveDev: false,
        permissions: ["ssm", "lambda"],
        _doNotAllowOthersToBind: true,
      });
    }

    // create the custom resource provider if it doesn't exist
    if (!UpdateLambdaEnv.provider) {
      UpdateLambdaEnv.provider = new Provider(scope, "UpdateLambdaEnvProvider", {
        onEventHandler: UpdateLambdaEnv.fn,
      });
    }

    // update the lambda environment
    const Arn = Fn?.functionArn;
    if (Arn) {
      new CustomResource(scope, `${id}Cr`, {
        serviceToken: UpdateLambdaEnv.provider.serviceToken,
        properties: { Arn, App: app.name, Stage: app.stage, _RunOnEveryDeploy: new Date() },
      });
    }
  }
}
