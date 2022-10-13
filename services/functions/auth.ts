import { AuthHandler, GithubAdapter, Session } from "@serverless-stack/node/auth";
import { Config } from "@serverless-stack/node/config";
import { Table, ZUserEntity } from "../table";
import axios from "axios";
import { DynamoDB } from "aws-sdk";
import { z } from "zod";

declare module "@serverless-stack/node/auth" {
  export interface SessionTypes {
    user: {
      id: string;
      username: string;
      name: string;
      avatar_url: string;
      github_url: string;
      roles: string[];
      permissions: string[];
    };
  }
}

// GithubUserInfo
const ZGithubUserInfo = z.object({
  login: z.string(),
  id: z.number(),
  name: z.string(),
  avatar_url: z.string(),
  html_url: z.string(),
});
type GithubUserInfoType = z.infer<typeof ZGithubUserInfo>;

// create the table
if (!process.env.tableName) throw new Error("'tableName' is missing from environment.");
const client = new DynamoDB.DocumentClient({ region: process.env.tableRegion });
const table = new Table({ tableName: process.env.tableName, client });

export const handler = AuthHandler({
  providers: {
    github: GithubAdapter({
      clientID: (Config as any).GITHUB_CLIENT_ID,
      clientSecret: (Config as any).GITHUB_CLIENT_SECRET,
      scope: "user",
      onSuccess: async (tokenset) => {
        // get the userinfo from github
        const githubUserInfo = await axios
          .get<GithubUserInfoType>("https://api.github.com/user", {
            headers: { Authorization: `${tokenset.token_type} ${tokenset.access_token}` },
          })
          .then(({ data }) => ZGithubUserInfo.parse(data))
          .then((data) => ({
            id: data.id.toString(),
            username: data.login,
            name: data.name,
            avatar_url: data.avatar_url,
            github_url: data.html_url,
          }));

        // get the user from our database (if they exist)
        let user = await table.entities.user
          .get({ pk: `user#${githubUserInfo.id}`, sk: `user#${githubUserInfo.id}` })
          .then(({ Item }) => Item);

        // sync our database with github info if user exists
        if (user)
          user = await table.entities.user
            .update(githubUserInfo, { returnValues: "ALL_NEW" })
            .then(({ Attributes }) => Attributes);
        // create the user if they don't exist
        else if (!user)
          user = await table.entities.user
            .update({ ...githubUserInfo, roles: ["basic"] }, { returnValues: "ALL_NEW" })
            .then(({ Attributes }) => Attributes);

        // ensure that user has correct schema
        user = ZUserEntity.parse(user);

        return Session.parameter({
          redirect: "https://google.com",
          type: "user",
          properties: {
            id: user.id,
            username: user.username,
            name: user.name,
            avatar_url: user.avatar_url ? user.avatar_url : "",
            github_url: user.github_url ? user.github_url : "",
            roles: user.roles ? user.roles : [],
            permissions: user.permissions ? user.permissions : [],
          },
        });
      },
    }),
  },
});
