import { Provider } from "aws-cdk-lib/custom-resources";
import { CustomResource } from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { App, Config } from "sst/constructs";
import { Function } from "sst/constructs";

export interface ConfigParameterProps {
  /** Value of the parameter. */
  value: string;
}

/**
 * A wrapper around the Config.Parameter from SST. The benefits of this "construct" are that it is not a Construct and
 * allows you to update the SSM parameter without the issue of circular dependencies.
 *
 * @description
 * Suppose you want to create a Config.Parameter to hold the SITE_URL. When deploying your SSRSite you want to allow it
 * to access this SITE_URL parameter as the SSRSite's Lambda cannot know the CloudFront url before being deployed. This
 * is a situation where we need to update the SSM Parameter after the SSRSite has been deployed and we know the new
 * SITE_URL value.
 *
 * If this was a construct, then referencing the `site.url` value after the SSRSite has been deployed (to update the
 * Config.Parameter) would cause a circular dependency. This is avoided by creating the Config.Parameter as a property
 * on this class. Then if we want to update this later, it's as simple as calling the `.update` function.
 */
export class ConfigParameter {
  /** The ID of the parameter. */
  readonly id: string;
  /** The Value of the parameter. */
  value: string;
  /** The SST Config.Parameter construct. */
  Parameter: Config.Parameter;

  /** The scope of the Config.Parameter. */
  private readonly scope: Construct;
  /** The Key or Path of the SSM Paramter. */
  private readonly key: string;
  /** The Lambda used to update an SSM value. */
  private static fn: Function;
  /** The Provider used to update an SSM value. */
  private static provider: Provider;

  constructor(stack: Construct, id: string, { value }: ConfigParameterProps) {
    const app = stack.node.root as App;

    // store the configuration
    this.id = id;
    this.value = value;
    this.scope = stack;
    this.key = `/sst/${app.name}/${app.stage}/Parameter/${id}/value`;

    // create the Config.Parameter
    this.Parameter = new Config.Parameter(stack, id, { value });
  }

  /** Updates the SSM parameter */
  update(value: string) {
    this.value = value;

    // create the custom resource lambda if it doesn't exist
    if (!ConfigParameter.fn) {
      ConfigParameter.fn = new Function(this.scope, `UpdateConfigParameterFn`, {
        architecture: "arm_64",
        handler: "packages/functions/src/custom-resource/config-parameter.handler",
        enableLiveDev: false,
        permissions: ["ssm"],
        _doNotAllowOthersToBind: true,
      });
    }

    // create the custom resource provider if it doesn't exist
    if (!ConfigParameter.provider) {
      ConfigParameter.provider = new Provider(this.scope, "UpdateConfigParamterProvider", {
        onEventHandler: ConfigParameter.fn,
      });
    }

    // update the SSM parameter
    new CustomResource(this.scope, `UpdateConfigParameterCr${this.id}`, {
      serviceToken: ConfigParameter.provider.serviceToken,
      properties: { Value: value, Path: this.key },
    });
  }
}
