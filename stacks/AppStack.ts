import { StackContext, RemixSite, Table, Config, Function, Bucket } from "sst/constructs";
import { Architecture } from "aws-cdk-lib/aws-lambda";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Provider } from "aws-cdk-lib/custom-resources";
import { CustomResource, RemovalPolicy } from "aws-cdk-lib/core";
import { Distribution, ViewerProtocolPolicy, LambdaEdgeEventType } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export function AppStack({ app, stack }: StackContext) {
  // define global variables
  const prodUrl = "https://spencerduball.com";

  // define global parameters & secrets
  const REGION = new Config.Parameter(stack, "REGION", { value: app.region });
  const SITE_URL = new Config.Parameter(stack, "SITE_URL", { value: "http://localhost:3000" });
  const GITHUB_CLIENT_ID = new Config.Secret(stack, "GITHUB_CLIENT_ID");
  const GITHUB_CLIENT_SECRET = new Config.Secret(stack, "GITHUB_CLIENT_SECRET");
  const DATABASE_URL = new Config.Secret(stack, "DATABASE_URL");

  // define shared resoureces
  const updateSsmParameterFn = new Function(stack, "UpdateSsmParameterFn", {
    architecture: "arm_64",
    handler: "packages/functions/src/custom-resource/deploy-fns.updateSsmParameter",
    enableLiveDev: false,
    permissions: ["ssm"],
  });

  //-----------------------------------------------------------------------------------------------
  // Create Table
  // ------------
  // This table will be the Key-Value store for this application.
  //-----------------------------------------------------------------------------------------------
  const table = new Table(stack, "table", {
    fields: { pk: "string", sk: "string", gsi1pk: "string", gsi1sk: "string" },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
    globalIndexes: { gsi1: { partitionKey: "gsi1pk", sortKey: "gsi1sk" } },
    cdk: {
      table: {
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: app.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
    timeToLiveAttribute: "ttl",
  });

  //-----------------------------------------------------------------------------------------------
  // Create Files Bucket
  // -------------------
  // This is the bucket for files. This needs to be created before the RemixSite in order to bind
  // this bucket to the RemixSite. We also need to create an SSM parameter for the BUCKET_URL.
  // This value will need to be updated after the SITE_URL has been determined in this stack.
  //
  // NOTE: PART 1/2
  //-----------------------------------------------------------------------------------------------
  // create the bucket
  const bucket = new Bucket(stack, "Bucket", {
    cdk: {
      bucket: {
        autoDeleteObjects: app.stage !== "prod",
        removalPolicy: app.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  // create the BUCKET_URL parameter
  const BUCKET_URL = new Config.Parameter(stack, "BUCKET_URL", {
    value: `https://${bucket.bucketName}.s3.${stack.region}.amazonaws.com`,
  });

  // add permissions for public files
  bucket.cdk.bucket.addToResourcePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new AnyPrincipal()],
      actions: ["s3:GetObject"],
      resources: [`${bucket.bucketArn}/blog/*`],
    })
  );

  //-----------------------------------------------------------------------------------------------
  // Create Remix Site
  // -----------------
  // This is the actual remix website deployment.
  //-----------------------------------------------------------------------------------------------
  const site = new RemixSite(stack, "web", {
    customDomain: app.stage === "prod" ? new URL(prodUrl).hostname : undefined,
    path: "packages/web/",
    cdk: { server: { architecture: Architecture.ARM_64 } },
    warm: app.stage === "prod" ? 10 : undefined,
    bind: [table, bucket, REGION, SITE_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, DATABASE_URL, BUCKET_URL],
  });

  //-----------------------------------------------------------------------------------------------
  // Update Site Url
  // ---------------
  // The domain name can be 1 of 3 options:
  // 1) "https://spencerduball.com"             - this should be the value in a 'prod' stage.
  // 2) "https://d111111abcdef8.cloudfront.net" - this should be the value in a 'staging' stage.
  // 3) "http://localhost:3000"                 - this should be the value in a 'dev' stage.
  //
  // We need to first create the parameter with the other parameters, this reference needs to be
  // passed to the RemixSite, 'site'. This 'site' will then output the cloudfront url (option 2)
  // and now we have all the information needed to update the domain name to the appropriate value.
  //-----------------------------------------------------------------------------------------------
  // determine the new url
  let siteUrl = "http://localhost:3000";
  if (app.stage === "dev") siteUrl = "http://localhost:3000";
  else if (app.stage === "prod") siteUrl = "https://spencerduball.com";
  else if (site.url) siteUrl = site.url;

  // update the SITE_URL parameter value
  const updateSiteUrlProvider = new Provider(stack, "UpdateSiteUrlParameter", { onEventHandler: updateSsmParameterFn });
  new CustomResource(stack, "UpdateSiteUrlCr", {
    serviceToken: updateSiteUrlProvider.serviceToken,
    properties: {
      Value: siteUrl,
      Name: `/sst/${app.name}/${app.stage}/Parameter/SITE_URL/value`,
    },
  });

  //-----------------------------------------------------------------------------------------------
  // Create Public Bucket
  // --------------------
  // The final SITE_URL is necessary in order to finish creating the public bucket:
  // 1) A CORS rule using the SITE_URL needs to be added
  // 2) The BUCKET_URL parameter needs to be updated based on the SITE_URL
  // 3) An SSL Certificate, CNAME Record, and CloudFront distribution all need the SITE_URL in
  //    order to have the `files.${my-domain-name}` for the bucket's url.
  //
  // NOTE: PART 2/2
  //-----------------------------------------------------------------------------------------------

  // TODO: We have to cast the 'publicBucket.cdk' to CdkBucket, add a PR/Issue to SST as this
  // should be a type of CdkBucket. That way all of the methods such as '.addCorsRule()' are
  // available via the cdk escape hatch.

  // create the CORS rule
  // bucket.cdk.addCorsRule({
  //   allowedMethods: [HttpMethods.DELETE, HttpMethods.GET, HttpMethods.HEAD, HttpMethods.POST, HttpMethods.PUT],
  //   allowedHeaders: ["*"],
  //   allowedOrigins: [siteUrl],
  // });

  // add the CORS rule to the S3 bucket
  //
  // Note: The 'bucket.cdk.bucket' technically should have the '.addCorsRule' method, but upon
  // trying to use this, it still introduces circular dependencies because of the 'site.url' which
  // comes from 'siteUrl' parameter. For this reason, we need to use a CustomResource to implement
  // '.addCorsRule' and query SSM for the updated 'SITE_URL' parameter.
  const addCorsRuleFn = new Function(stack, "AddCorsRuleFn", {
    architecture: "arm_64",
    handler: "packages/functions/src/custom-resource/deploy-fns.addCorsRule",
    enableLiveDev: false,
    permissions: ["s3"],
  });
  const addCorsRuleProvider = new Provider(stack, "AddCorsRuleProvider", { onEventHandler: addCorsRuleFn });
  new CustomResource(stack, "AddCorsRuleCr", {
    serviceToken: addCorsRuleProvider.serviceToken,
    properties: {
      BucketName: bucket.bucketName,
      SiteUrl: siteUrl,
    },
  });

  // determine the bucketUrl
  let bucketUrl = `https://${bucket.bucketName}.s3.${stack.region}.amazonaws.com`;
  if (app.stage !== "dev") bucketUrl = `${siteUrl}/files`;

  // update the BUCKET_URL parameter value
  const updateBucketUrlProvider = new Provider(stack, "UpdateBucketUrlParameter", {
    onEventHandler: updateSsmParameterFn,
  });
  new CustomResource(stack, "UpdateBucketUrlCr", {
    serviceToken: updateBucketUrlProvider.serviceToken,
    properties: {
      Value: bucketUrl,
      Name: `/sst/${app.name}/${app.stage}/Parameter/BUCKET_URL/value`,
    },
  });

  // Allow access to the S3 bucket from the "{SITE_URL}/files/*" path when not localhost.
  if (app.stage !== "dev" && site.cdk?.distribution) {
    // create the lambda@edge to redirect 4XX - 5XX requests to the "{SITE_URL}/404" page.
    const errorResponseRedirectFn = new Function(stack, "ErrorResponseRedirectFn", {
      handler: "packages/functions/src/cloudfront/errorResponseRedirect.handler",
      enableLiveDev: false,
      permissions: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
          resources: ["arn:aws:logs:*:*:log-group:/aws/cloudfront/*"],
        }),
      ],
    });
    // Add the "files/*" behavior to the site's distribution
    (site.cdk.distribution as any as Distribution).addBehavior("files/*", new S3Origin(bucket.cdk.bucket), {
      edgeLambdas: [
        {
          eventType: LambdaEdgeEventType.ORIGIN_RESPONSE,
          functionVersion: errorResponseRedirectFn.currentVersion,
        },
      ],
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });
  }

  //-----------------------------------------------------------------------------------------------
  // Define Stack Outputs
  // --------------------
  // The outputs of the stack.
  //-----------------------------------------------------------------------------------------------
  stack.addOutputs({ SiteUrl: siteUrl });
}
