import { Stack, StackProps, RemovalPolicy, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  UserPool,
  AccountRecovery,
  ClientAttributes,
} from "aws-cdk-lib/aws-cognito";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { getSecureSSMParameter } from "../app/constructs/secure-ssm-parameter";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import path from "path";

export interface AuthStackProps extends StackProps {
  httpApi: HttpApi;
}

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

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
    // create the user pool
    const pool = new UserPool(this, "UserPool", {
      accountRecovery: AccountRecovery.NONE,
      enableSmsRole: false,
      removalPolicy: RemovalPolicy.DESTROY,
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
      },
    });
    new StringParameter(this, "UserPoolId", {
      parameterName: "/spencerduball/env/USER_POOL_ID",
      stringValue: pool.userPoolId,
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
      parameterName: "/spencerduball/env/USER_POOL_CLIENT_ID",
      stringValue: client.userPoolClientId,
    });

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
    const githubClientId = getSecureSSMParameter(
      this,
      "GithubClientId",
      "/spencerduball/env/GITHUB_CLIENT_ID"
    );
    const githubClientSecret = StringParameter.fromStringParameterName(
      this,
      "GithubClientSecret",
      "/spencerduball/env/GITHUB_CLIENT_SECRET"
    );
    const githubClientCallback = StringParameter.fromStringParameterName(
      this,
      "GithubClientCallback",
      "/spencerduball/env/GITHUB_CLIENT_CALLBACK"
    );
    const cipherInfo = getSecureSSMParameter(
      this,
      "CipherInfo",
      "/spencerduball/env/CIPHER_INFO"
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
        GITHUB_CLIENT_ID: githubClientId.getResponseField("Parameter.Value"),
        DDB_TABLE_NAME: csrfTable.tableName,
        REGION: this.region,
      },
    });
    const githubSigninIntegration = new HttpLambdaIntegration(
      "GithubAuthIntegration",
      githubSigninFn
    );
    props.httpApi.addRoutes({
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
          GITHUB_CLIENT_ID: githubClientId.getResponseField("Parameter.Value"),
          GITHUB_CLIENT_SECRET: githubClientSecret.stringValue,
          GITHUB_CLIENT_CALLBACK: githubClientCallback.stringValue,
          DDB_TABLE_NAME: csrfTable.tableName,
          REGION: this.region,
          USER_POOL_ID: pool.userPoolId,
          USER_POOL_CLIENT_ID: client.userPoolClientId,
          PASSWORD_CIPHER_INFO: cipherInfo.getResponseField("Parameter.Value"),
        },
      }
    );
    const githubOAuthCallbackIntegration = new HttpLambdaIntegration(
      "GithubOAuthCallbackIntegration",
      githubOAuthCallbackFn
    );
    props.httpApi.addRoutes({
      path: "/auth/github/callback",
      methods: [HttpMethod.GET],
      integration: githubOAuthCallbackIntegration,
    });
    csrfTable.grantReadWriteData(githubOAuthCallbackFn);
    pool.grant(githubOAuthCallbackFn, "cognito-idp:*");
  }
}
