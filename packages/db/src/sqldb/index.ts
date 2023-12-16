import { Kysely, ColumnType } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";
// TODO: The @ts-ignore can be removed after the ms@3 is released. This is caused because of this bug:
// https://github.com/vercel/ms/pull/191
// @ts-ignore

/* ------------------------------------------------------------------------------------------------------------
 * Define Tables
 * ------------------------------------------------------------------------------------------------------------ */
export interface IUser {
  id: ColumnType<number, number, never>;
  username: string;
  name: string;
  avatar_url: string;
  github_url: string;
  created_at: ColumnType<Date, Date | undefined, never>;
  modified_at: ColumnType<Date, Date | undefined, Date>;
}

export interface IRole {
  id: ColumnType<string, string, never>;
  description: string;
  created_at: ColumnType<Date, Date | undefined, never>;
  modified_at: ColumnType<Date, Date | undefined, Date>;
}

export interface IUserRole {
  user_id: ColumnType<number, number, never>;
  role_id: ColumnType<string, string, never>;
}

/* ------------------------------------------------------------------------------------------------------------
 * Define Database
 * ------------------------------------------------------------------------------------------------------------ */
export interface IDatabase {
  users: IUser;
  roles: IRole;
  user_roles: IUserRole;
}

export type SqlDbClient = Kysely<IDatabase>;

export function createClient(url: string, authToken: string) {
  return new Kysely<IDatabase>({ dialect: new LibsqlDialect({ url, authToken }) });
}
