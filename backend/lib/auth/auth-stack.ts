import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  CfnApi,
  CfnIntegration,
  CfnRoute,
  CfnStage,
} from "aws-cdk-lib/aws-apigatewayv2";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import path from "path";

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create the api
    const httpApi = new CfnApi(this, "AuthApi", {
      name: "AuthApi",
      protocolType: "HTTP",
    });

    // create route to redirect users to https://github.com/login/oauth/authorize to sign-in
    const githubAuthFn = new NodejsFunction(this, "GithubAuth", {
      entry: path.join(__dirname, "lambda", "github-auth.ts"),
      handler: "githubAuthLink",
    });
    const githubAuthInt = new CfnIntegration(this, "GithubAuth_Integration", {
      apiId: httpApi.ref,
      integrationType: "AWS_PROXY",
      integrationMethod: "POST",
      integrationUri: githubAuthFn.functionArn,
      payloadFormatVersion: "2.0",
    });
    const githubAuthRoute = new CfnRoute(this, "GithubAuth_Route", {
      apiId: httpApi.ref,
      routeKey: "POST /api/signin/github",
      authorizationType: "NONE",
      target: `integrations/${githubAuthInt.ref}`,
    });

    // attach policy statements
    let arnParts = { stage: "*", method: "POST", path: "api/signin/github" };
    githubAuthFn.addPermission("HttpApiInvokePolicy", {
      action: "lambda:InvokeFunction",
      principal: new ServicePrincipal("apigateway.amazonaws.com"),
      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${httpApi.ref}/${arnParts.stage}/${arnParts.method}/${arnParts.path}`,
    });

    // create a stage and deployment for the api
    const defaultStage = new CfnStage(this, "AuthApi_Stage-Default", {
      apiId: httpApi.ref,
      stageName: "$default",
      autoDeploy: true,
    });
  }
}
