import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import {
  Bucket,
  Stack,
  Table,
  Function,
  FunctionProps,
  Api,
  Script,
  Cron,
} from "@serverless-stack/resources";
import ms from "ms";

function seconds(milliseconds: number) {
  return milliseconds / 1000;
}

export interface UserPoolProps {
  /** The auth API. */
  api: Api;
  /** The refresh token validity duration in seconds. */
  refreshTokenDuration?: number;
  /** The access token validity duration in seconds. */
  accessTokenDuration?: number;
}

export class UserPool extends Construct {
  public readonly refreshTokenDuration: number;
  public readonly accessTokenDuration: number;
  public readonly publicBucket: Bucket;
  public readonly keyTable: Table;
  public readonly otcTable: Table;

  constructor(scope: Stack, id: string, props: UserPoolProps) {
    super(scope, id);

    // set the token durations
    this.refreshTokenDuration =
      props.refreshTokenDuration || seconds(ms("7 days"));
    this.accessTokenDuration =
      props.accessTokenDuration || seconds(ms("1 hour"));

    ////////////////////////////////////////////////////////////////////////
    // (1) Setup Infrastructure
    ////////////////////////////////////////////////////////////////////////
    // create the public bucket to hold the jwks.json & openid-configuration
    this.publicBucket = new Bucket(scope, "PublicBucket", {
      cors: [{ allowedMethods: ["GET"], allowedOrigins: ["*"] }],
      cdk: {
        bucket: {
          removalPolicy: RemovalPolicy.DESTROY,
          publicReadAccess: true,
          websiteIndexDocument: "index.html",
          autoDeleteObjects: true,
        },
      },
    });

    // create a table to store the RSA key info
    this.keyTable = new Table(scope, "KeyTable", {
      fields: { PK: "string" },
      primaryIndex: { partitionKey: "PK" },
      stream: true,
      cdk: {
        table: {
          removalPolicy: RemovalPolicy.DESTROY,
          timeToLiveAttribute: "expires_at",
        },
      },
    });

    // create a table to store the auth one-time-codes
    this.otcTable = new Table(scope, "OTCTable", {
      fields: { PK: "string" },
      primaryIndex: { partitionKey: "PK" },
      cdk: { table: { removalPolicy: RemovalPolicy.DESTROY } },
    });

    ////////////////////////////////////////////////////////////////////////
    // (2) Setup Lambdas, Api, Operations On Infrastructure
    ////////////////////////////////////////////////////////////////////////
    // define environment for the lambda fns
    const LambdaEnv: FunctionProps["environment"] = {
      PUBLIC_BUCKET: this.publicBucket.bucketName,
      KEY_TABLE: this.keyTable.tableName,
      REFRESH_TOKEN_DURATION: this.refreshTokenDuration.toString(),
      ACCESS_TOKEN_DURATION: this.accessTokenDuration.toString(),
      ISSUER_URL: props.api.url,
    } as const;

    // listen to keyTable stream for INSERT & DELETE events to update jwks.json file
    this.keyTable.addConsumers(scope, {
      updateJwks: new Function(scope, "UpdateJwks", {
        handler: "functions/auth/user-pool/update-jwks.handler",
        environment: LambdaEnv,
        permissions: [this.publicBucket, this.keyTable],
      }),
    });

    // SSH Key Setup
    ///////////////////////////////////////////////////////////
    // create fn to rotate and create keys
    const rotateConfig = {
      handler: "functions/auth/user-pool/rotate-key.handler",
      environment: LambdaEnv,
      permissions: [this.publicBucket, this.keyTable],
    };
    const rotateFn = new Function(scope, "KeyRotateFn", rotateConfig);

    // create keys on initial deployment
    new Script(scope, "CreateInitialKeys", { onCreate: rotateConfig });

    // setup cron job that rotates keys every 3 months
    new Cron(scope, "ScheduledKeyRotation", {
      schedule: "rate(90 days)",
      job: rotateFn,
    });

    // add API route to rotate keys on demand
    props.api.addRoutes(scope, { "GET /key/rotate": rotateFn });
    ///////////////////////////////////////////////////////////

    // Static Files (.well-known files)
    ///////////////////////////////////////////////////////////
    // create jwks.json & openid-configuration files on initial deployment
    new Script(scope, "CreateOpenIDConfig", {
      onCreate: {
        handler: "functions/auth/user-pool/create-well-known.handler",
        environment: LambdaEnv,
        permissions: [this.publicBucket, this.keyTable],
      },
    });

    // add proxy routes to the .well-known files
    const publicBucketUrl = `http://${this.publicBucket.bucketName}.s3-website-${scope.region}.amazonaws.com`;
    props.api.addRoutes(scope, {
      "GET /.well-known": {
        type: "url",
        url: `${publicBucketUrl}/.well-known`,
      },
      "GET /.well-known/{proxy+}": {
        type: "url",
        url: `${publicBucketUrl}/.well-known/{proxy}`,
      },
    });
    ///////////////////////////////////////////////////////////
  }
}
