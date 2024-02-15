import { type ScriptInput } from "../../db/lib";
import { z } from "zod";
import fs from "fs-extra";
import { Config } from "sst/node/config";
import { sql } from "kysely";
import { glob } from "glob";
import mime from "mime";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";
import { ZMockGhUser } from "@spencerduballcom/db/ddb";
import { clearBucket, clearDdb } from "../../db/lib";

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

/**
 * This procedure is meant to be called from the database scripts and will insert seed data. This includes data
 * that represents the state of the application at a given point in time (users/posts/comments/etc).
 */
export async function up({ s3Client, sqldb, ddb }: ScriptInput) {
  if (!s3Client) throw new Error("s3Client was not passed and is required.");
  if (!sqldb) throw new Error("sqldb was not supplied and is required.");
  if (!ddb) throw new Error("ddb was not supplied and is required.");

  // --------------------------------------------------------------------------
  // Create Mock Github Database
  // ---------------------------
  // For testing and development this app will mock API requests that go to Github. These requests will be backed by a
  // database and files put up by us in this file.
  // --------------------------------------------------------------------------

  // Upload mock Github user's profile photos.
  const AssetsPath = new URL("./assets", import.meta.url);
  const assets = await glob(`${AssetsPath.pathname}/**/*`, { nodir: true });
  await Promise.all([
    assets.map(async (asset) => {
      const Key = "mock" + asset.replace(new RegExp(`^${AssetsPath.pathname}`), "");
      const Body = await fs.readFile(asset);
      const ContentType = mime.getType(asset) || "text/plain";
      const options = { Bucket: Bucket.Bucket.bucketName, Key, Body, ContentType };
      return s3Client.send(new PutObjectCommand(options));
    }),
  ]);

  // Populate the "mock-gh-users" ddb items.
  const mockGhUsersFile = new URL("./data/mock-gh-users.json", import.meta.url);
  const mockGhUsersData = await fs
    .readJson(mockGhUsersFile)
    .then((users) => ZMockGhUser.omit({ pk: true, sk: true, entity: true }).array().parse(users));
  for (let user of mockGhUsersData) user.avatar_url = user.avatar_url.replace(/\{\{S3_BUCKET\}\}/g, Config.BUCKET_URL);
  await ddb.table.batchWrite(mockGhUsersData.map((u) => ddb.entities.mockGhUser.putBatch(u)));

  // --------------------------------------------------------------------------
  // Seed Database Tables
  // --------------------------------------------------------------------------

  // seed the 'users' table
  const usersFile = new URL("./data/users.json", import.meta.url);
  const usersData = await fs.readJson(usersFile).then((users) => ZUser.array().parse(users));
  for (let user of usersData) user.avatar_url = user.avatar_url.replace(/\{\{S3_BUCKET\}\}/g, Config.BUCKET_URL);
  await sqldb.insertInto("users").values(usersData).execute();

  // seed the 'roles' table
  const rolesFile = new URL("./data/roles.json", import.meta.url);
  const rolesData = await fs.readJson(rolesFile).then((roles) => ZRole.array().parse(roles));
  await sqldb.insertInto("roles").values(rolesData).execute();

  // seed the 'user_roles' table
  const userRolesFile = new URL("./data/user_roles.json", import.meta.url);
  const userRolesData = await fs.readJson(userRolesFile).then((userRoles) => ZUserRole.array().parse(userRoles));
  await sqldb.insertInto("user_roles").values(userRolesData).execute();
}

/**
 * This procedure is meant to be called from the database scripts and will delete seed data.
 */
export async function down({ s3Client, sqldb, ddb }: ScriptInput) {
  if (!s3Client) throw new Error("s3Client was not passed and is required.");
  if (!sqldb) throw new Error("sqldb was not supplied and is required.");
  if (!ddb) throw new Error("ddb was not supplied and is required.");

  // delete mock github database
  await clearBucket({ Bucket: Bucket.Bucket.bucketName, s3Client, prefix: "mock/users/" });
  await clearDdb({ ddb, query: { pk: "mock_gh_user " } });

  // delete items from all tables
  await sql`DELETE FROM user_roles`.execute(sqldb);
  await sql`DELETE FROM roles`.execute(sqldb);
  await sql`DELETE FROM users`.execute(sqldb);
}
