import { RemovalPolicy } from "aws-cdk-lib";
import { StackContext, RemixSite, Config, Bucket, Table } from "sst/constructs";
import iam from "aws-cdk-lib/aws-iam";
import type { BucketCorsRule } from "sst/constructs";
import { HostedZone, CnameRecord } from "aws-cdk-lib/aws-route53";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Architecture } from "aws-cdk-lib/aws-lambda";

export function AppStack({ app, stack }: StackContext) {
  function SecretSsmPath(name: string) {
    return `/sst/${app.name}/${app.stage}/Secret/${name}/value`;
  }
  function ParameterSsmPath(name: string) {
    return `/sst/${app.name}/${app.stage}/Parameter/${name}/value`;
  }

  //---------------------------------------------------------------------------
  // Setup App Defaults
  //---------------------------------------------------------------------------
  const domainName = "spencerduball.com";
  let [autoDeleteObjects, removalPolicy] = [true, RemovalPolicy.DESTROY];
  if (app.stage === "prod") [autoDeleteObjects, removalPolicy] = [false, RemovalPolicy.RETAIN];

  //---------------------------------------------------------------------------
  // Define Secrets
  //---------------------------------------------------------------------------
  new Config.Secret(stack, "DATABASE_URL");
  new Config.Secret(stack, "GITHUB_CLIENT_ID");
  new Config.Secret(stack, "GITHUB_CLIENT_SECRET");

  //---------------------------------------------------------------------------
  // Create "files" Bucket
  // ---------------------
  // This bucket will be created to hold all assets such as blog attachments,
  // code files, project attachments, and any other files.
  //---------------------------------------------------------------------------
  // define CORS rule to allow uploads from "spencerduball.com"
  const bucketCors = {
    allowedMethods: ["POST", "GET", "DELETE"],
    allowedHeaders: ["*"],
    allowedOrigins: [app.stage === "prod" ? "yo" : "*"],
  } as BucketCorsRule;

  // create bucket
  const bucket = new Bucket(stack, "bucket", {
    cors: [bucketCors],
    cdk: { bucket: { autoDeleteObjects, removalPolicy } },
  });

  // add permission to allow public access to "/public" folder
  bucket.cdk.bucket.addToResourcePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()],
      actions: ["s3:GetObject"],
      resources: [`${bucket.bucketArn}/public/*`],
    })
  );

  // add CNAME record for the "files" bucket
  let bucketUrl = `https://${bucket.bucketName}.s3.${stack.region}.amazonaws.com`;
  if (app.stage === "prod") {
    const zone = HostedZone.fromLookup(stack, "Zone", { domainName });
    new CnameRecord(stack, "FilesBucketCname", { zone, recordName: "files", domainName });
    bucketUrl = `https://files.${domainName}`;
  }

  //---------------------------------------------------------------------------
  // Create Table
  //---------------------------------------------------------------------------
  const table = new Table(stack, "table", {
    fields: { pk: "string", sk: "string", gsi1pk: "string", gsi1sk: "string" },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
    globalIndexes: { gsi1: { partitionKey: "gsi1pk", sortKey: "gsi1sk" } },
    cdk: { table: { billingMode: BillingMode.PAY_PER_REQUEST } },
    timeToLiveAttribute: "ttl",
  });

  //---------------------------------------------------------------------------
  // Create Remix Site
  // -----------------
  // This is the actual website. We need to pass in environment variables and
  // the path to secrets; this is because Remix is bundled agains Node14 which
  // does not support top-level await statements. Without top-level await the
  // SST "Config" will not work correctly.
  //---------------------------------------------------------------------------
  // create the site
  const SiteEnv = {
    // general
    STAGE: stack.stage,
    REGION: stack.region,
    // bucket
    BUCKET_NAME: bucket.bucketName,
    BUCKET_URL: bucketUrl,
    // table
    TABLE_NAME: table.tableName,
    // database
    DATABASE_URL_SECRET: SecretSsmPath("DATABASE_URL"),
    // github
    GITHUB_CLIENT_ID: SecretSsmPath("GITHUB_CLIENT_ID"),
    GITHUB_CLIENT_ID_SECRET: SecretSsmPath("GITHUB_CLIENT_ID_SECRET"),
    // site url - This is needed because the "request.url" in remix will be the
    //            proxied lambda url, not the cloudfront url (or domain name).
    SITE_URL: ParameterSsmPath("SITE_URL"),
  } as const;
  const site = new RemixSite(stack, "web", {
    path: "packages/web/",
    customDomain: app.stage === "prod" ? domainName : undefined,
    cdk: { server: { architecture: Architecture.ARM_64 } },
    environment: SiteEnv,
  });

  // set the SITE_URL parameter
  const SITE_URL = new Config.Parameter(stack, "SITE_URL", {
    value: app.stage === "prod" ? `https://${domainName}` : site.url || "http://localhost:3000",
  });

  // add permissions to the site
  const ssmSecretArns = ["DATABASE_URL", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"].map(
    (name) => `arn:aws:ssm:${app.region}:${app.account}:parameter/sst/${app.name}/${app.stage}/Secret/${name}/value`
  );
  const ssmParamArns = ["SITE_URL"].map(
    (name) => `arn:aws:ssm:${app.region}:${app.account}:parameter/sst/${app.name}/${app.stage}/Parameter/${name}/value`
  );
  site.attachPermissions([
    bucket,
    table,
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["ssm:GetParameter"],
      resources: [...ssmSecretArns, ...ssmParamArns],
    }),
  ]);

  // define the stack outputs
  stack.addOutputs({ SiteUrl: SITE_URL.value });
}
