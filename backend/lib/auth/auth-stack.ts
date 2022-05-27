import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  HttpApi,
  HttpMethod,
  DomainName,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import path from "path";

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create the domain name
    const domainName = new DomainName(this, "HttpApiDomainName", {
      domainName: "api.spencerduball.com",
      certificate: Certificate.fromCertificateArn(
        this,
        "DomainNameCertificate",
        `arn:aws:acm:${this.region}:${this.account}:certificate/0dcc1656-ee38-4f9d-81cd-30686d1469b3`
      ),
    });

    // create the api
    const httpApi = new HttpApi(this, "AuthApi", {
      apiName: "AuthApi",
      defaultDomainMapping: { domainName },
    });

    // create the signin route
    const githubSigninFn = new NodejsFunction(this, "GithubSigninFn", {
      entry: path.join(__dirname, "lambda", "github-signin.ts"),
      handler: "githubSignin",
    });
    const githubSigninIntegration = new HttpLambdaIntegration(
      "GithubAuthIntegration",
      githubSigninFn
    );
    httpApi.addRoutes({
      path: "/auth/signin/github",
      methods: [HttpMethod.POST],
      integration: githubSigninIntegration,
    });

    // create the oauth callback route
    const githubOAuthCallbackFn = new NodejsFunction(
      this,
      "GithubOAuthCallbackFn",
      {
        entry: path.join(__dirname, "lambda", "github-oauth-callback.ts"),
        handler: "githubOAuthCallback",
      }
    );
    const githubOAuthCallbackIntegration = new HttpLambdaIntegration(
      "GithubOAuthCallbackIntegration",
      githubOAuthCallbackFn
    );
    httpApi.addRoutes({
      path: "/auth/github/callback",
      methods: [HttpMethod.GET],
      integration: githubOAuthCallbackIntegration,
    });
  }
}
