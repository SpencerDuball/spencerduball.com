import { type ScriptInput } from "../../../db/lib";
import { z } from "zod";
import fs from "fs-extra";
import { Config } from "sst/node/config";
import { sql } from "kysely";

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
export async function up({ sqldb }: ScriptInput) {
  if (!sqldb) throw new Error("sqldb was not supplied and is required.");

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
export async function down({ sqldb }: ScriptInput) {
  if (!sqldb) throw new Error("sqldb was not supplied and is required.");

  // delete items from all tables
  await sql`DELETE FROM user_roles`.execute(sqldb);
  await sql`DELETE FROM roles`.execute(sqldb);
  await sql`DELETE FROM users`.execute(sqldb);
}
