import { Construct } from "constructs";
import { Provider } from "aws-cdk-lib/custom-resources";
import { CustomResource } from "aws-cdk-lib/core";
import { type IBucket, type CorsRule } from "aws-cdk-lib/aws-s3";
import { Function } from "sst/constructs";

export interface SetCorsRulesProps {
  /** The Bucket name whose CORS rules will be updated. */
  bucket: IBucket;
  /** The CORS rules that will be set on the Bucket. */
  rules: CorsRule[];
}

/**
 * Sets (overwrites) the CORS rules on a bucket with the values supplied.
 *
 * NOTE -
 * The CdkBucket technically has the '.addCorsRule' method, but upon trying to use this, it still introduces circular
 * dependencies. This shouldn't even be a method on the CdkBucket because it has to be called when the construct is
 * created - pretty pointless implementation.
 */
export class SetCorsRules extends Construct {
  static fn: Function;
  static provider: Provider;

  constructor(scope: Construct, id: string, { bucket, rules }: SetCorsRulesProps) {
    super(scope, id);

    // create the custom resource lambda if it doesn't exist
    if (!SetCorsRules.fn) {
      SetCorsRules.fn = new Function(scope, "SetCorsRulesFn", {
        architecture: "arm_64",
        handler: "packages/functions/src/custom-resource/set-cors-rules.handler",
        enableLiveDev: false,
        permissions: ["s3"],
        _doNotAllowOthersToBind: true,
      });
    }

    // create the custom resource provider if it doesn't exist
    if (!SetCorsRules.provider) {
      SetCorsRules.provider = new Provider(scope, "SetCorsRulesProvider", {
        onEventHandler: SetCorsRules.fn,
      });
    }

    // update the CORS rules
    new CustomResource(scope, `${id}Cr`, {
      serviceToken: SetCorsRules.provider.serviceToken,
      properties: { Bucket: bucket.bucketName, Rules: rules },
    });
  }
}
