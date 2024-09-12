import { Kysely, sql } from "kysely";

async function up(db: Kysely<any>): Promise<void> {
  // Create indexes on the `mock_gh_otcs` table.
  // 1. `expires_at` - Used when cleaning up expired mock Github OAuth tokens.
  await db.schema.createIndex("mock_gh_otcs_expires_at_idx").on("mock_gh_otcs").column("expires_at").execute();

  // Create indexes on the `mock_gh_access_tokens` table.
  // 1. `expires_at` - Used when cleaning up expired mock Github access tokens.
  await db.schema
    .createIndex("mock_gh_access_tokens_expires_at_idx")
    .on("mock_gh_access_tokens")
    .column("expires_at")
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("mock_gh_access_tokens_expires_at_idx").ifExists().execute();
  await db.schema.dropIndex("mock_gh_otcs_expires_at_idx").ifExists().execute();
}

export { up, down };
