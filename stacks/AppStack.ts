import { StackContext, RemixSite, Table, Config, Function, Bucket } from "sst/constructs";
import { Architecture } from "aws-cdk-lib/aws-lambda";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib/core";
import { Distribution, ViewerProtocolPolicy, LambdaEdgeEventType, CachePolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { UpdateLambdaEnv } from "../constructs/UpdateLambdaEnv";
import { ConfigParameter } from "../constructs/ConfigParameter";
import { SetCorsRules } from "../constructs/SetCorsRules";
import { HttpMethods } from "aws-cdk-lib/aws-s3";
import { SsrDomainProps } from "sst/constructs/SsrSite";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

export function AppStack({ app, stack }: StackContext) {
  // define global variables
  const prodUrl = "https://spencerduball.com";

  // define global parameters & secrets
  const REGION = new ConfigParameter(stack, "REGION", { value: app.region });
  const SITE_URL = new ConfigParameter(stack, "SITE_URL", { value: "http://localhost:3000" });
  const GITHUB_CLIENT_ID = new Config.Secret(stack, "GITHUB_CLIENT_ID");
  const GITHUB_CLIENT_SECRET = new Config.Secret(stack, "GITHUB_CLIENT_SECRET");
  const DATABASE_URL = new Config.Secret(stack, "DATABASE_URL");
  const DATABASE_AUTH_TOKEN = new Config.Secret(stack, "DATABASE_AUTH_TOKEN");
  const MOCKS_ENABLED = new ConfigParameter(stack, "MOCKS_ENABLED", {
    value: app.stage === "prod" ? "FALSE" : "TRUE",
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
  // this bucket to the RemixSite. After creating the bucket we will:
  //
  // 1. Create the BUCKET_URL parameter which will be referenced in the RemixSite.
  // 2. Define the public folder patterns and add them to the Bucket's ResourcePolicy.
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

  // 1. Create the BUCKET_URL parameter
  const BUCKET_URL = new ConfigParameter(stack, "BUCKET_URL", {
    value: `https://${bucket.bucketName}.s3.amazonaws.com`,
  });

  // 2. Define the public folder patterns, and add the permissions to the ResourcePolicy.
  const publicBucketPaths = [`${bucket.bucketArn}/blog/*`];
  if (MOCKS_ENABLED.value === "TRUE") publicBucketPaths.push(`${bucket.bucketArn}/mock/*`);

  bucket.cdk.bucket.addToResourcePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new AnyPrincipal()],
      actions: ["s3:GetObject"],
      resources: publicBucketPaths,
    }),
  );

  //-----------------------------------------------------------------------------------------------
  // Create Remix Site
  // -----------------
  // This is the actual remix website deployment. There are a few things we need to do after the
  // site has been deployed:
  //
  // 1. Create a variable that indicates if the site has been deployed to cloudfront. If so there
  //    are modifications we will want to make to the CloudFront distribution and other items.
  // 2. Update the SITE_URL. If the site has been deployed to CloudFront we need to make sure the
  //    SITE_URL SSM parameter has been updated with this new value.
  // 3. Add a CORS rule so that our deployed site can access S3 resources.
  //
  //    The domain name can be 1 of 3 options:
  //    1. "https://spencerduball.com"             - The SITE_URL in a 'prod' stage.
  //    2. "https://d111111abcdef8.cloudfront.net" - The SITE_URL in any deployed (staging) stage.
  //    3. "http://localhost:3000"                 - The SITE_URL in any local (dev) stage.
  //-----------------------------------------------------------------------------------------------
  // create the custom domain certificate
  let customDomain: SsrDomainProps | undefined = undefined;
  if (app.stage === "prod") {
    customDomain = {
      isExternalDomain: true,
      domainName: new URL(prodUrl).hostname,
      cdk: {
        certificate: Certificate.fromCertificateArn(
          stack,
          "Certificate",
          "arn:aws:acm:us-east-1:561720044356:certificate/a440dd53-e46a-42e5-a347-8b69c35d3c3b",
        ),
      },
    };
  }

  // Deploy the site
  const site = new RemixSite(stack, "web", {
    customDomain,
    path: "packages/web/",
    cdk: { server: { architecture: Architecture.ARM_64 } },
    warm: app.stage === "prod" ? 10 : undefined,
    bind: [
      table,
      bucket,
      REGION.Parameter,
      SITE_URL.Parameter,
      GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET,
      DATABASE_URL,
      DATABASE_AUTH_TOKEN,
      BUCKET_URL.Parameter,
      MOCKS_ENABLED.Parameter,
    ],
  });

  // 1. Create boolean that indicates if there is a CloudFront deployment
  const SiteDeployedToCloudFront = !!site.url;

  // 2. Update the SITE_URL with the correct URL
  const UrlPortExpr = /\:d+$/;
  if (app.stage === "prod") SITE_URL.update(prodUrl);
  else if (SiteDeployedToCloudFront) SITE_URL.update(site.url);

  // 3. Add a CORS rule to the bucket
  new SetCorsRules(stack, "SetBucketCors", {
    bucket: bucket.cdk.bucket,
    rules: [
      {
        allowedHeaders: ["*"],
        allowedMethods: [HttpMethods.DELETE, HttpMethods.GET, HttpMethods.HEAD, HttpMethods.POST, HttpMethods.PUT],
        allowedOrigins: [SITE_URL.value.replace(UrlPortExpr, "")],
      },
    ],
  });

  //-----------------------------------------------------------------------------------------------
  // Update CloudFront for 404 and Files Bucket
  // ------------------------------------------
  // When we create the RemixSite and there is a CloudFront deployment our website is accessible
  // from an HTTPS domain name. We also want the public files we serve from our Bucket to be
  // accessed from this HTTPS domain name under the "{SITE_URL}/files/*" prefix. In order to
  // achieve thisthere are a few actions we need to perform:
  //
  // 1. We need to redirect any error responses 4XX - 5XX to our "{SITE_URL}/404" page. If we don't
  //    do this our error pages will use the default S3 Bucket error page.
  // 2. We need to change all requests to the CloudFront distribution with prefix of "files/" to
  //    remove the "files/" prefix when the request goes to the S3 Bucket.
  // 3. We need to ensure that the CachePolicy is set to CACHING_DISABLED. This is necessary or we
  //    will have stale files served to our users. This could be tweaked later.
  // 4. We need to add a behavior to our CloudFront distribution that applies the prior three
  //    bullets.
  // 5. Update the BUCKET_URL Parameter to point to the proxied S3 Bucket instead of the raw S3 URL
  //
  // NOTE: PART 2/2
  //-----------------------------------------------------------------------------------------------
  if (SiteDeployedToCloudFront && site.cdk?.distribution) {
    // 1. Create the lambda@edge to redirect 4XX - 5XX requests to the "{SITE_URL}/404" page.
    const errorResponseRedirectFn = new Function(stack, "ErrorResponseRedirectFn", {
      handler: "packages/functions/src/cloudfront/errorResponseRedirect.handler",
      enableLiveDev: false,
      _doNotAllowOthersToBind: true,
    });
    // 2. Create the lambda@edge to change the 'uri' path to remove the "files/" prefix
    const filesRequestUriFn = new Function(stack, "FilesRequestUriFn", {
      handler: "packages/functions/src/cloudfront/filesRequestUri.handler",
      enableLiveDev: false,
      _doNotAllowOthersToBind: true,
    });

    // 3. Define a cachePolicy
    const cachePolicy = CachePolicy.CACHING_DISABLED;

    // 4. Add the "files/*" behavior to the site's distribution
    (site.cdk.distribution as any as Distribution).addBehavior("files/*", new S3Origin(bucket.cdk.bucket), {
      edgeLambdas: [
        { eventType: LambdaEdgeEventType.ORIGIN_RESPONSE, functionVersion: errorResponseRedirectFn.currentVersion },
        { eventType: LambdaEdgeEventType.ORIGIN_REQUEST, functionVersion: filesRequestUriFn.currentVersion },
      ],
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy,
    });

    // 5. Update the BUCKET_URL to use the proxied URL of "{SITE_URL}/files"
    BUCKET_URL.update(`${SITE_URL.value}/files`);
  }

  //-----------------------------------------------------------------------------------------------
  // Update Lambda Environment
  // -------------------------
  // In our deployment we have updated the SST Parameters for a few items. What has actually
  // happend is the SSM Parameter has been updated, but the lambdas that consume them have no idea
  // that there was an update as these SST Parameters are inlined as environment variables. We need
  // to run a custom resource that will compare environments and update the lambdas.
  //-----------------------------------------------------------------------------------------------
  new UpdateLambdaEnv(stack, "UpdateRemixEnv", { Fn: site.cdk?.function });

  //-----------------------------------------------------------------------------------------------
  // Define Stack Outputs
  // --------------------
  // The outputs of the stack.
  //-----------------------------------------------------------------------------------------------
  stack.addOutputs({ SiteUrl: SITE_URL.value });
}
