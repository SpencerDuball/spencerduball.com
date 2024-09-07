import { Kysely, sql } from "kysely";

async function up(db: Kysely<any>): Promise<void> {
  // Create indexes on the `users` table.
  // 1. `github_id` - Used when signing in with Github.
  await db.schema.createIndex("users_github_id_idx").on("users").column("github_id").execute();

  // Create indexes on the `oauth_state_codes` table.
  // 1. `expires_at` - Used when cleaning up expired state codes.
  await db.schema
    .createIndex("oauth_state_codes_expires_at_idx")
    .on("oauth_state_codes")
    .column("expires_at")
    .execute();

  // Create indexes on the `sessions` table.
  // 1. `expires_at` - Used when cleaning up expired sessions.
  await db.schema.createIndex("sessions_expires_at_idx").on("sessions").column("expires_at").execute();

  // Create indexes on the `session_secrets` table.
  // 1. `expires_at` - Used when cleaning up expired session secrets.
  await db.schema.createIndex("session_secrets_expires_at_idx").on("session_secrets").column("expires_at").execute();
}

async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("session_secrets_expires_at_idx").execute();
  await db.schema.dropIndex("sessions_user_id_idx").execute();
  await db.schema.dropIndex("sessions_expires_at_idx").execute();
  await db.schema.dropIndex("oauth_state_codes_expires_at_idx").execute();
  await db.schema.dropIndex("users_github_id_idx").execute();
}

export { up, down };
