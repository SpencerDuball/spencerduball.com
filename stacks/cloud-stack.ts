import { Auth, Api, Config, StackContext } from "@serverless-stack/resources";

export function CloudStack({ stack }: StackContext) {
  // create the api
  const api = new Api(stack, "api", {
    routes: {
      "GET /hello": "functions/lambda.handler",
    },
  });

  // create the auth resources
  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "functions/auth.handler",
      config: [new Config.Secret(stack, "GITHUB_CLIENT_ID"), new Config.Secret(stack, "GITHUB_CLIENT_SECRET")],
    },
  });
  auth.attach(stack, { api });
}
