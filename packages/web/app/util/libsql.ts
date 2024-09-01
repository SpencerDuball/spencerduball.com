import { ColumnType, Nullable, Kysely } from "kysely";
import { ZEnv } from "./env";
import { LibsqlDialect } from "@libsql/kysely-libsql";

// -------------------------------------------------------------------------------------
// Define the Database Types
// -------------------------------------------------------------------------------------
export interface UsersTable {
  id: ColumnType<string, string, never>;
  github_id: ColumnType<number, number, never>;
  username: ColumnType<string, string, string>;
  name: ColumnType<string, string, string>;
  avatar_url: ColumnType<string, string, string>;
  github_url: ColumnType<string, string, string>;
  created_at: ColumnType<string, never, never>;
  modified_at: ColumnType<string, never, string>;
}
export interface RolesTable {
  id: ColumnType<string, string, never>;
  description: Nullable<ColumnType<string, string, string>>;
  created_at: ColumnType<string, never, never>;
  modified_at: ColumnType<string, never, string>;
}
export interface UserRolesTable {
  user_id: ColumnType<string, string, never>;
  role_id: ColumnType<string, string, never>;
}
export interface OAuthStateCodesTable {
  id: ColumnType<string, string, never>;
  redirect_uri: ColumnType<string, string, never>;
  expires_at: ColumnType<string, never, never>;
  created_at: ColumnType<string, never, never>;
  modified_at: ColumnType<string, never, string>;
}
export interface SessionsTable {
  id: ColumnType<string, string, never>;
  user_id: ColumnType<string, string, never>;
  roles: Nullable<ColumnType<string, string, string>>; // A JSON array of role IDs.
  expires_at: ColumnType<string, never, string>;
  created_at: ColumnType<string, never, never>;
  modified_at: ColumnType<string, never, string>;
}

export interface Database {
  users: UsersTable;
  roles: RolesTable;
  user_roles: UserRolesTable;
  oauth_state_codes: OAuthStateCodesTable;
  sessions: SessionsTable;
}

// -------------------------------------------------------------------------------------
// Create the Kysely Instance
// -------------------------------------------------------------------------------------
export const db = new Kysely<Database>({ dialect: new LibsqlDialect({ url: ZEnv.parse(process.env).LIBSQL_URL }) });
