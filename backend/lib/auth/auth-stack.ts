import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  HttpApi,
  HttpMethod,
  DomainName,
  CorsHttpMethod,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
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
      corsPreflight: {
        allowOrigins: ["https://spencerduball.com"],
        allowMethods: [CorsHttpMethod.ANY],
      },
    });

    // create oauth CSRF validation table
    const csrfTable = new Table(this, "GithubAuthCSRFTable", {
      partitionKey: { name: "PK", type: AttributeType.STRING },
      timeToLiveAttribute: "TTL",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // get environment variables
    const GITHUB_CLIENT_ID = StringParameter.fromStringParameterName(
      this,
      "env-GITHUB_CLIENT_ID",
      "/spencerduball/env/GITHUB_CLIENT_ID"
    );
    const GITHUB_CLIENT_SECRET = StringParameter.fromStringParameterName(
      this,
      "env-GITHUB_CLIENT_SECRET",
      "/spencerduball/env/GITHUB_CLIENT_SECRET"
    );
    const GITHUB_CLIENT_CALLBACK = StringParameter.fromStringParameterName(
      this,
      "env-GITHUB_CLIENT_CALLBACK",
      "/spencerduball/env/GITHUB_CLIENT_CALLBACK"
    );

    // create the signin route
    const githubSigninFn = new NodejsFunction(this, "GithubSigninFn", {
      entry: path.join(__dirname, "lambda", "github-signin.ts"),
      handler: "githubSignin",
      environment: {
        GITHUB_CLIENT_ID: GITHUB_CLIENT_ID.stringValue,
        DDB_TABLE_NAME: csrfTable.tableName,
        DDB_TABLE_REGION: this.region,
      },
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
    csrfTable.grantReadWriteData(githubSigninFn);

    // create the oauth callback route
    const githubOAuthCallbackFn = new NodejsFunction(
      this,
      "GithubOAuthCallbackFn",
      {
        entry: path.join(__dirname, "lambda", "github-oauth-callback.ts"),
        handler: "githubOAuthCallback",
        environment: {
          GITHUB_CLIENT_ID: GITHUB_CLIENT_ID.stringValue,
          GITHUB_CLIENT_SECRET: GITHUB_CLIENT_SECRET.stringValue,
          GITHUB_CLIENT_CALLBACK: GITHUB_CLIENT_CALLBACK.stringValue,
          DDB_TABLE_NAME: csrfTable.tableName,
          DDB_TABLE_REGION: this.region,
        },
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
    csrfTable.grantReadWriteData(githubOAuthCallbackFn);
  }
}
