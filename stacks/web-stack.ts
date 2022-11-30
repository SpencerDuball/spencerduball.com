import { RemixSite, StackContext, App, Table, Bucket } from "@serverless-stack/resources";
import { RemovalPolicy } from "aws-cdk-lib";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";

const getParamterStorePath = (app: App, name: string) => `/sst/${app.name}/${app.stage}/secrets/${name}`;

export function WebStack({ stack, app }: StackContext) {
  // set the app defaults
  if (app.local || app.stage !== "prod") app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY);

  // create the table
  const table = new Table(stack, "table", {
    fields: { pk: "string", sk: "string", gsi1pk: "string", gsi1sk: "string", gsi2pk: "string", gsi2sk: "string" },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
    globalIndexes: {
      gsi1: { partitionKey: "gsi1pk", sortKey: "gsi1sk" },
      gsi2: { partitionKey: "gsi2pk", sortKey: "gsi2sk" },
    },
    cdk: { table: { billingMode: BillingMode.PAY_PER_REQUEST } },
    timeToLiveAttribute: "ttl",
  });

  // create the bucket
  const bucket = new Bucket(stack, "bucket");
  bucket.cdk.bucket.addToResourcePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()],
      actions: ["s3:GetObject"],
      resources: [`${bucket.bucketArn}/public/*`],
    })
  );

  // create a Remix site
  const site = new RemixSite(stack, "web", {
    path: "web/",
    edge: false,
    environment: {
      REGION: stack.region,
      TABLE_NAME: table.tableName,
      BUCKET_NAME: bucket.bucketName,
      GITHUB_CLIENT_ID_PATH: getParamterStorePath(app, "GITHUB_CLIENT_ID"),
      GITHUB_CLIENT_SECRET_PATH: getParamterStorePath(app, "GITHUB_CLIENT_SECRET"),
    },
  });
  site.attachPermissions([table, bucket]);

  // export the site url
  stack.addOutputs({ SiteURL: site.url });
}
