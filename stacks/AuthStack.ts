import { Api, StackContext } from "@serverless-stack/resources";
import { UserPool } from "../constructs/auth/user-pool";

/////////////////////////////////////////////////////////////////////////////
// ** Information on JWK & OAuth Configuration for AWS HTTP API Authorizer **
//
// For information about what is required for authenticating with JWTs see:
// https://dev.to/oneadvanced/jwtio-signature-validation-4dhk
// https://www.jeremydaly.com/verifying-self-signed-jwt-tokens-with-aws-http-apis/
//
// For information about what is store in a jwks.json file, see below:
// https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-set-properties
//
// ** How this Service Works **
// (1) Spin Up
// - AuthStack creates & stores the initial RSA keys in the secretsTable
// - AuthStack creates the .well-known/ files used by external services to verify
//   our token signature. See the 'dev.to' link above for more details.
//
// (2) Github Sign In
// - When signing in with Github or any configured OAuth provider, the user will
//   go through the normal OAuth process for the service. After user data is returned,
//   the OAuth callback route will create the user or sign the user in.
// - To sign the user in, the OAuth callback route will generate a one-time-code to
//   be stored in the secretsTable with a 1-hour TTL. After this is stored in the secrets
//   table, the OAuth callback will POST /token with the one-time-code.
//
// (3) Authenticate
// - REFRESH_TOKEN_AUTH - With a valid refresh token, the user can send a request to the
//   /sign_in endpoint specifying the "REFRESH_TOKEN_AUTH" auth flow. This will validate
//   the refresh token signature with the public key and then generate a one-time-code to
//   be stored in the secretsTable with a 1-hour TTL. After this is stored in the secrets
//   table, the lambda will POST /token with the one-time-code.
//
// (4) Get Access Tokens (POST /token with the one-time-code)
// - When users get a one-time-code generated in the Github Sign In (or any other auth
//   flow that is implemented), they will POST /token with the one-time-code. This code
//   has been stored in the secretsTable and maps to the user sub. The /token route will
//   then get the user info from the userpool table, and generate the access and refresh
//   tokens to be returned to the caller.
//
// (5) Rotating Keys
// - This service will rotate keys every 3 months. The way this works is by creating a cron
//   job that runs every 3 months and calls the /keys/rotate route specifying the kid to
//   rotate. This will set the TTL field on the key in the secretsTable to the maximum length
//   of the refreshToken. We will also update the KEY#CURRENT field in the secretsTable to use
//   the newly generated key, this way all refresh tokens will work until the key is deleted.
// - The secretsTable is setup with DynamoDB Streams. This feature allows us to react to events
//   in near-real-time, so when a key is deleted we will use the streams feature to call a
//   lambda function that will udpate the jwks.json file.
/////////////////////////////////////////////////////////////////////////////
export function AuthStack({ stack }: StackContext) {
  const api = new Api(stack, "AuthApi");

  // create the user pool
  const userPool = new UserPool(stack, "UserPool", { api });
}
