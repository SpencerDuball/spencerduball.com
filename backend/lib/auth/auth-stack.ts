import { Stack, StackProps, RemovalPolicy, Duration } from "aws-cdk-lib";
import {
  AwsCustomResource,
  PhysicalResourceId,
  AwsCustomResourcePolicy,
} from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  HttpApi,
  HttpMethod,
  DomainName,
  CorsHttpMethod,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import {
  UserPool,
  AccountRecovery,
  ClientAttributes,
} from "aws-cdk-lib/aws-cognito";
import path from "path";

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create the domain name
    const domainName = new DomainName(this, "HttpApiDomainName", {
      domainName: "api.spencerduball.com",
      certificate: Certificate.fromCertificateArn(
        this,
        "DomainNameCertificate",
        `arn:aws:acm:${this.region}:${this.account}:certificate/0dcc1656-ee38-4f9d-81cd-30686d1469b3`
      ),
    });

    // create the api
    const httpApi = new HttpApi(this, "AuthApi", {
      apiName: "AuthApi",
      defaultDomainMapping: { domainName },
      corsPreflight: {
        allowOrigins: ["https://spencerduball.com"],
        allowMethods: [CorsHttpMethod.ANY],
      },
    });

    /////////////////////////////////////////////////////////////////////////////
    // (1) Custom User Pool
    //
    // With the custom user pool, we will allow our users to get an access token
    // from github and then store the necessary user info in DynamoDB. This is
    // necessary as with the Github credential alone, we cannot block or assign
    // users to special groups. Special groups would allow expanded or blocked
    // access to APIs.
    //
    // This is how we will actually manage the users in our apps, but we will use
    // github to sign in.
    /////////////////////////////////////////////////////////////////////////////
    // create the user pool and client
    const pool = new UserPool(this, "UserPool", {
      accountRecovery: AccountRecovery.NONE,
      autoVerify: { email: true },
      enableSmsRole: false,
      removalPolicy: RemovalPolicy.RETAIN,
      selfSignUpEnabled: false,
      signInCaseSensitive: false,
      standardAttributes: {
        profilePicture: {
          required: true,
          mutable: true,
        },
        profilePage: {
          required: true,
          mutable: true,
        },
        email: {
          required: true,
          mutable: true,
        },
      },
    });
    const client = pool.addClient("UserPoolClient", {
      accessTokenValidity: Duration.minutes(60),
      authFlows: { adminUserPassword: true },
      disableOAuth: true,
      idTokenValidity: Duration.minutes(60),
      refreshTokenValidity: Duration.days(30),
      writeAttributes: new ClientAttributes().withStandardAttributes({
        profilePicture: true,
        profilePage: true,
        email: true,
      }),
    });
    new StringParameter(this, "UserPoolClientId", {
      parameterName: "/spencerduball/env/PUBLIC_USER_POOL_CLIENT_ID",
      stringValue: client.userPoolClientId,
    });

    // retrieve the cipher info used to encrypt the admin defined passwords
    const decryptPasswordCipherInfo = new AwsCustomResource(
      this,
      "DecryptedPasswordCipherInfo",
      {
        onCreate: {
          service: "SSM",
          action: "getParameter",
          parameters: {
            Name: "/spencerduball/env/PASSWORD_CIPHER_INFO",
            WithDecryption: true,
          },
          physicalResourceId: PhysicalResourceId.fromResponse("Parameter.ARN"),
        },
        policy: AwsCustomResourcePolicy.fromSdkCalls({
          resources: AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
      }
    );

    /////////////////////////////////////////////////////////////////////////////
    // (2) Github OAuth Sign In
    //
    // We need to setup a couple pieces to allow users to authenticate with
    // Github. First, Github uses OAuth2.0 + PKCE (authorization code) to protect
    // against CSRF attacks. See this link for full details on the flow:
    // https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
    // Because of this we need to store these authorization codes serverside to
    // ensure requests are not being intercepted.
    //
    // Below we create the table to store the CSRF tokens, as well as create the
    // routes used for signin and callback.
    /////////////////////////////////////////////////////////////////////////////
    // get environment variables
    const GITHUB_CLIENT_ID = StringParameter.fromStringParameterName(
      this,
      "env-GITHUB_CLIENT_ID",
      "/spencerduball/env/GITHUB_CLIENT_ID"
    );
    const GITHUB_CLIENT_SECRET = StringParameter.fromStringParameterName(
      this,
      "env-GITHUB_CLIENT_SECRET",
      "/spencerduball/env/GITHUB_CLIENT_SECRET"
    );
    const GITHUB_CLIENT_CALLBACK = StringParameter.fromStringParameterName(
      this,
      "env-GITHUB_CLIENT_CALLBACK",
      "/spencerduball/env/GITHUB_CLIENT_CALLBACK"
    );

    // create oauth CSRF validation table
    const csrfTable = new Table(this, "GithubAuthCSRFTable", {
      partitionKey: { name: "PK", type: AttributeType.STRING },
      timeToLiveAttribute: "TTL",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // create the signin route
    const githubSigninFn = new NodejsFunction(this, "GithubSigninFn", {
      entry: path.join(__dirname, "lambda", "github-signin.ts"),
      handler: "githubSignin",
      environment: {
        GITHUB_CLIENT_ID: GITHUB_CLIENT_ID.stringValue,
        DDB_TABLE_NAME: csrfTable.tableName,
        DDB_TABLE_REGION: this.region,
      },
    });
    const githubSigninIntegration = new HttpLambdaIntegration(
      "GithubAuthIntegration",
      githubSigninFn
    );
    httpApi.addRoutes({
      path: "/auth/signin/github",
      methods: [HttpMethod.POST],
      integration: githubSigninIntegration,
    });
    csrfTable.grantReadWriteData(githubSigninFn);

    // create the oauth callback route
    const githubOAuthCallbackFn = new NodejsFunction(
      this,
      "GithubOAuthCallbackFn",
      {
        entry: path.join(__dirname, "lambda", "github-oauth-callback.ts"),
        handler: "githubOAuthCallback",
        environment: {
          GITHUB_CLIENT_ID: GITHUB_CLIENT_ID.stringValue,
          GITHUB_CLIENT_SECRET: GITHUB_CLIENT_SECRET.stringValue,
          GITHUB_CLIENT_CALLBACK: GITHUB_CLIENT_CALLBACK.stringValue,
          DDB_TABLE_NAME: csrfTable.tableName,
          REGION: this.region,
          USER_POOL_ID: pool.userPoolId,
          USER_POOL_CLIENT_ID: client.userPoolClientId,
          PASSWORD_CIPHER_INFO:
            decryptPasswordCipherInfo.getResponseField("Parameter.Value"),
        },
      }
    );
    const githubOAuthCallbackIntegration = new HttpLambdaIntegration(
      "GithubOAuthCallbackIntegration",
      githubOAuthCallbackFn
    );
    httpApi.addRoutes({
      path: "/auth/github/callback",
      methods: [HttpMethod.GET],
      integration: githubOAuthCallbackIntegration,
    });
    csrfTable.grantReadWriteData(githubOAuthCallbackFn);
    pool.grant(githubOAuthCallbackFn, "cognito-idp:*");
  }
}
