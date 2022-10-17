import { RemixSite, StackContext, App, Table } from "@serverless-stack/resources";
import { RemovalPolicy } from "aws-cdk-lib";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";

const getParamterStorePath = (app: App, name: string) => `/sst/${app.name}/${app.stage}/secrets/${name}`;

export function WebStack({ stack, app }: StackContext) {
  // set the app defaults
  if (app.local || app.stage !== "prod") app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY);

  // create the table
  const table = new Table(stack, "table", {
    fields: { pk: "string", sk: "string" },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
    cdk: { table: { billingMode: BillingMode.PAY_PER_REQUEST } },
    timeToLiveAttribute: "ttl",
  });

  // create a Remix site
  const site = new RemixSite(stack, "web", {
    path: "web/",
    edge: false,
    environment: {
      REGION: stack.region,
      TABLE_NAME: table.tableName,
      GITHUB_CLIENT_ID_PATH: getParamterStorePath(app, "GITHUB_CLIENT_ID"),
      GITHUB_CLIENT_SECRET_PATH: getParamterStorePath(app, "GITHUB_CLIENT_SECRET"),
    },
  });

  // export the site url
  stack.addOutputs({ SiteURL: site.url });
}
