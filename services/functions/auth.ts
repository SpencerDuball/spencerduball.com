import { AuthHandler, GithubAdapter } from "@serverless-stack/node/auth";
import { Config } from "@serverless-stack/node/config";

export const handler = AuthHandler({
  providers: {
    github: GithubAdapter({
      clientID: (Config as any).GITHUB_CLIENT_ID,
      clientSecret: (Config as any).GITHUB_CLIENT_SECRET,
      scope: "user",
      onSuccess: async (tokenset) => {
        console.log(tokenset);
        return {
          statusCode: 200,
          body: JSON.stringify(tokenset),
        };
      },
    }),
  },
});
