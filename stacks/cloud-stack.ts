import { Auth, Api, Config, StackContext, Table, Stack } from "@serverless-stack/resources";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

export function CloudStack({ stack }: StackContext) {
  // create the table
  const table = new Table(stack, "table", {
    fields: { pk: "string", sk: "string" },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
    cdk: { table: { billingMode: BillingMode.PAY_PER_REQUEST, removalPolicy: RemovalPolicy.DESTROY } },
  });

  // create the api
  const api = new Api(stack, "api", {
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

  // create the auth resources
  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "functions/auth.handler",
      config: [new Config.Secret(stack, "GITHUB_CLIENT_ID"), new Config.Secret(stack, "GITHUB_CLIENT_SECRET")],
    },
  });
  auth.attach(stack, { api });
}
