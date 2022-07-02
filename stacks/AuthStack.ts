import { Api, StackContext } from "@serverless-stack/resources";

export function AuthStack({ stack }: StackContext) {
  const api = new Api(stack, "AuthApi", {
    authorizers: {
      auth0: {
        type: "jwt",
        jwt: {
          audience: ["07ca0fd71a149b6cffd91f0354994d0a"],
          issuer: "https://dev-m1nz3fln.us.auth0.com/",
        },
      },
    },
    routes: {
      "GET /auth/callback": {
        function: { handler: "functions/auth/callback.handler" },
      },
      "GET /hello": {
        authorizer: "auth0",
        authorizationScopes: ["read:hello"],
        function: {
          handler: "functions/hello.handler",
        },
      },
    },
  });
}
