import { z } from "zod";
import fs from "fs-extra";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { PgClient } from "../../src/pg";
import { ZMockGhUser, type Ddb } from "../../src/ddb";
import { Config } from "sst/node/config";
import { Bucket } from "sst/node/bucket";
import { glob } from "glob";
import mime from "mime";

interface DbScriptProps {
  db: PgClient;
  s3: S3Client;
  ddb: Ddb;
}

export const ZUser = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  avatar_url: z.string(),
  github_url: z.string(),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
});
export type IUser = z.infer<typeof ZUser>;

export const ZRole = z.object({
  id: z.string(),
  description: z.string(),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
});
export type IRole = z.infer<typeof ZRole>;

export const ZUserRole = z.object({
  user_id: z.number(),
  role_id: z.string(),
});
export type IUserRole = z.infer<typeof ZUserRole>;

/** Performs the seed operations. */
export async function main({ db, s3, ddb }: DbScriptProps) {
  // upload all assets
  const AssetsPath = new URL("./assets", import.meta.url);
  const assets = await glob(`${AssetsPath.pathname}/**/*`, { nodir: true });
  await Promise.all([
    assets.map(async (asset) => {
      const Key = "mock" + asset.replace(new RegExp(`^${AssetsPath.pathname}`), "");
      const Body = await fs.readFile(asset);
      const ContentType = mime.getType(asset) || "text/plain";
      const options = { Bucket: Bucket.Bucket.bucketName, Key, Body, ContentType };
      return s3.send(new PutObjectCommand(options));
    }),
  ]);

  // seed the 'mock-gh-users' ddb items
  const mockGhUsersFile = new URL("./data/mock-gh-users.json", import.meta.url);
  const mockGhUsersData = await fs
    .readJson(mockGhUsersFile)
    .then((users) => ZMockGhUser.omit({ pk: true, sk: true, entity: true }).array().parse(users));
  for (let user of mockGhUsersData) user.avatar_url = user.avatar_url.replace(/\{\{S3_BUCKET\}\}/g, Config.BUCKET_URL);
  await ddb.table.batchWrite(mockGhUsersData.map((u) => ddb.entities.mockGhUser.putBatch(u)));

  // seed the 'users' table
  const usersFile = new URL("./data/users.json", import.meta.url);
  const usersData = await fs.readJson(usersFile).then((users) => ZUser.array().parse(users));
  for (let user of usersData) user.avatar_url = user.avatar_url.replace(/\{\{S3_BUCKET\}\}/g, Config.BUCKET_URL);
  await db.insertInto("users").values(usersData).execute();

  // seed the 'roles' table
  const rolesFile = new URL("./data/roles.json", import.meta.url);
  const rolesData = await fs.readJson(rolesFile).then((roles) => ZRole.array().parse(roles));
  await db.insertInto("roles").values(rolesData).execute();

  // seed the 'user_roles' table
  const userRolesFile = new URL("./data/user_roles.json", import.meta.url);
  const userRolesData = await fs.readJson(userRolesFile).then((userRoles) => ZUserRole.array().parse(userRoles));
  await db.insertInto("user_roles").values(userRolesData).execute();
}
