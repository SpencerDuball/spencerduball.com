import { LibsqlDialect } from "@libsql/kysely-libsql";
import { ColumnType, Kysely, Nullable, type LogEvent } from "kysely";
import { ZEnv } from "./env";
import { getLogger } from "./logger";

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
  expires_at: ColumnType<string, never, string>;
  created_at: ColumnType<string, never, never>;
  modified_at: ColumnType<string, never, string>;
}
export interface SessionSecretsTable {
  id: ColumnType<string, string, never>;
  inactive_at: ColumnType<string, never, never>;
  expires_at: ColumnType<string, never, never>;
  created_at: ColumnType<string, never, never>;
  modified_at: ColumnType<string, never, never>;
}

// Note this is a mock table for testing purposes.
export interface MockGhOtcsTable {
  id: ColumnType<string, string, never>;
  scope: ColumnType<string, string, never>;
  github_id: ColumnType<number, number, never>;
  expires_at: ColumnType<string, never, never>;
  created_at: ColumnType<string, never, never>;
  modified_at: ColumnType<string, never, never>;
}

// Note this is a mock table for testing purposes.
export interface MockGhAccessTokensTable {
  id: ColumnType<string, string, never>;
  scope: ColumnType<string, string, never>;
  user_id: ColumnType<number, number, never>;
  expires_at: ColumnType<string, never, never>;
  created_at: ColumnType<string, never, never>;
  modified_at: ColumnType<string, never, never>;
}

export interface Database {
  users: UsersTable;
  roles: RolesTable;
  user_roles: UserRolesTable;
  oauth_state_codes: OAuthStateCodesTable;
  sessions: SessionsTable;
  session_secrets: SessionSecretsTable;
  mock_gh_otcs: MockGhOtcsTable;
  mock_gh_access_tokens: MockGhAccessTokensTable;
}

// -------------------------------------------------------------------------------------
// Create the Kysely Instance
// -------------------------------------------------------------------------------------

function log(event: LogEvent) {
  const {
    level,
    queryDurationMillis,
    query: { sql, parameters },
  } = event;
  if (level === "error") {
    getLogger().info(
      { traceId: "40595738", type: level, durationMs: queryDurationMillis, sql, parameters },
      "Query error event.",
    );
  } else {
    getLogger().info({ traceId: "1c597327", type: level, durationMs: queryDurationMillis }, "Query info event.");
  }
}

export const db = new Kysely<Database>({
  dialect: new LibsqlDialect({ url: ZEnv.parse(process.env).LIBSQL_URL }),
  log,
});
