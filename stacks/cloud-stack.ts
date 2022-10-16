import { Api, StackContext, Table, Stack, Auth, Config } from "@serverless-stack/resources";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

export function CloudStack({ stack, app }: StackContext) {
  // create apigw proxy to remove circular dependencies upon api and frontend for non-prod environments
  const webProxy = new Api(stack, "web-proxy", {});
  const siteUrl = app.local ? "http://localhost:3000" : webProxy.url;

  // create the table
  const table = new Table(stack, "table", {
    fields: { pk: "string", sk: "string" },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
    cdk: { table: { billingMode: BillingMode.PAY_PER_REQUEST, removalPolicy: RemovalPolicy.DESTROY } },
  });

  // create the api
  const api = new Api(stack, "api", {
    cors: { allowCredentials: true, allowOrigins: [siteUrl], allowMethods: ["ANY"], allowHeaders: ["*"] },
    defaults: {
      function: {
        environment: { tableName: table.tableName, tableRegion: Stack.of(table).region },
        permissions: [table],
      },
    },
    routes: {
      "GET /hello": "functions/lambda.handler",
    },
  });
  stack.addOutputs({ ApiUrl: api.url });

  // create the auth resources
  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "functions/auth.handler",
      config: [new Config.Secret(stack, "GITHUB_CLIENT_ID"), new Config.Secret(stack, "GITHUB_CLIENT_SECRET")],
      environment: { redirectUrl: siteUrl },
    },
  });
  auth.attach(stack, { api });

  return { webProxy, api, auth };
}
