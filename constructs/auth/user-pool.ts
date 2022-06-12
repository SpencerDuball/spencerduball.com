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
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import ms from "ms";

function seconds(milliseconds: number) {
  return milliseconds / 1000;
}

export interface IKeyRecord {
  /** The primary key. */
  PK: `KEY#${string}`;
  /** The unique ID of the key item. */
  kid: string;
  /** The key type. This is used in the jwks.json file to let services know how to verify the key signature. */
  kty: "RSA";
  /** The encryption algorithm used. All keys are RS256, RSA + SHA256 hashed. */
  alg: "RS256";
  /** Specifies the use of the jwt, in this instance as a signature of the issuer. */
  use: "sig";
  /** The exponent for the RSA public key. */
  e: string;
  /** The modulus for the RSA public key. */
  n: string;
  /** The validity duration in seconds of the refresh token. */
  refresh_token_duration: number;
  /** The validity duration in seconds of the access token. */
  access_token_duration: number;
  /** The public key in PEM format. */
  public_key: string;
  /** The private key in PEM format. */
  private_key: string;
  /** The TTL timestamp in seconds. */
  expires_at?: number;
}

export interface IUserRecord {
  /**
   * The primary key.
   * @example `USER#${preferred_username}`
   */
  PK: `USER#${string}`;
  /** The type of the user, could be GITHUB, CREDENTIALS, etc. */
  type: string;
  /** The username of the user. */
  preferred_username: string;
  /** The profile page of the user. */
  profile: string;
  /** The profile picture url of the user. */
  picture: string;
  /** The email address of the user. */
  email: string;
  /** The space delimited scope string of the user. */
  scope?: string;
  /** The suspension length for the user. */
  suspension?: number;
}

export interface IRefreshTokenRecord {
  /**
   * The primary key.
   * @example `REFRESH_TOKEN#${uuid}`
   */
  PK: `REFRESH_TOKEN#${string}`;
  /** The ID of the refresh token. */
  uuid: string;
  /**
   * The ID of the user associated with the refresh token.
   * @example `${preferred_username}`
   */
  user: string;
  /** The expiration time of the refresh token in UTC (seconds) format. */
  expires_at?: number;
}

export interface UserPoolProps {
  /** The auth API. */
  api: Api;
  /** The refresh token validity duration in seconds. */
  refreshTokenDuration?: number;
  /** The access token validity duration in seconds. */
  accessTokenDuration?: number;
  /**
   * The key rotation frequency.
   *
   * IMPORTANT! Make sure if `rotationFrequency` is specified that the frequency is LESS
   * than the `refreshTokenDuration` or else your keyTable will grow infinately!
   * */
  rotationFrequency?: `rate(${string})`;
}

export class UserPool extends Construct {
  public readonly refreshTokenDuration: number;
  public readonly accessTokenDuration: number;
  public readonly rotationFrequency: `rate(${string})`;
  public readonly publicBucket: Bucket;
  public readonly keyTable: Table;
  public readonly userTable: Table;
  public readonly invokeApiStatement: PolicyStatement;

  constructor(scope: Stack, id: string, props: UserPoolProps) {
    super(scope, id);

    // set the token durations
    this.refreshTokenDuration =
      props.refreshTokenDuration || seconds(ms("7 days"));
    this.accessTokenDuration =
      props.accessTokenDuration || seconds(ms("1 hour"));

    // set the rotation frequency
    this.rotationFrequency = props.rotationFrequency || "rate(90 days)";
    if (this.refreshTokenDuration >= seconds(ms(this.rotationFrequency))) {
      if (props.rotationFrequency) {
        const errorMsg = `rotationFrequency = ${props.rotationFrequency} must be greater than refreshTokenDuration = ${props.refreshTokenDuration}`;
        throw new Error(errorMsg);
      }
      let newRate = ms(this.refreshTokenDuration * 2, { long: true });
      this.rotationFrequency = `rate(${newRate})`;
    }

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

    // create a table to store the RSA key info.
    /** {@link IKeyRecord} */
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

    // create the user table
    /** {@link IUserRecord} */
    /** {@link IRefreshTokenRecord} */
    this.userTable = new Table(scope, "UserTable", {
      fields: { PK: "string" },
      primaryIndex: { partitionKey: "PK" },
      cdk: {
        table: {
          removalPolicy: RemovalPolicy.DESTROY,
          timeToLiveAttribute: "expires_at",
        },
      },
    });

    // expose invoke permissions statement for user pool api. Other providers can grant their
    // functions this permissions statement to get tokens, CRUD users
    this.invokeApiStatement = new PolicyStatement({
      actions: ["execute-api:Invoke"],
      effect: Effect.ALLOW,
      resources: [
        `arn:aws:execute-api:${scope.region}:${scope.account}:${props.api.httpApiId}/*/*/*`,
      ],
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

    // setup cron job that rotates keys
    new Cron(scope, "ScheduledKeyRotation", {
      schedule: this.rotationFrequency,
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

    // setup tokening service routes
    props.api.addRoutes(scope, {
      "GET /token": {
        function: {
          handler: "functions/auth/token.handler",
          permissions: [this.keyTable, this.userTable],
          environment: {
            KEY_TABLE: this.keyTable.tableName,
            USER_TABLE: this.userTable.tableName,
          },
        },
        authorizer: "iam",
      },
    });
    // CRUD User
    // POST /user - Need to be able to create users from providers.
    // GET /user/{id} - Need to be able to get user info.
    // DELETE /user/{id} - Need to be able to delete users from pool.
    // PATCH /user/{id} - Need to be able to update user info.

    // seed the database for test
    if (scope.stage !== "prod") {
      new Function(scope, "SeedUserTableFn", {
        handler: "functions/auth/user-pool/seed-user-table.handler",
        environment: { USER_TABLE: this.userTable.tableName },
        permissions: [this.userTable],
      });
      new Script(scope, "SeedUserTable", {
        onCreate: {
          handler: "functions/auth/user-pool/seed-user-table.handler",
          environment: { USER_TABLE: this.userTable.tableName },
          permissions: [this.userTable],
        },
      });
    }
  }
}
