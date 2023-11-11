import { StackContext, RemixSite, Table } from "sst/constructs";
import { Architecture } from "aws-cdk-lib/aws-lambda";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";

export function AppStack({ app, stack }: StackContext) {
  //-----------------------------------------------------------------------------------------------
  // Create Table
  // ------------
  // This table will be the Key-Value store for this application.
  //-----------------------------------------------------------------------------------------------
  const table = new Table(stack, "table", {
    fields: { pk: "string", sk: "string", gsi1pk: "string", gsi1sk: "string" },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
    globalIndexes: { gsi1: { partitionKey: "gsi1pk", sortKey: "gsi1sk" } },
    cdk: { table: { billingMode: BillingMode.PAY_PER_REQUEST } },
    timeToLiveAttribute: "ttl",
  });

  //-----------------------------------------------------------------------------------------------
  // Create Remix Site
  // -----------------
  // This is the actual remix website deployment.
  //-----------------------------------------------------------------------------------------------
  const site = new RemixSite(stack, "web", {
    path: "packages/web/",
    cdk: { server: { architecture: Architecture.ARM_64 } },
    warm: 10,
    bind: [table],
  });
}
